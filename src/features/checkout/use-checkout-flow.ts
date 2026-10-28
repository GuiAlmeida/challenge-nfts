import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { PublicUser } from '@/contracts/auth'
import type { CreateOrder } from '@/contracts/order'
import type { Quote } from '@/contracts/quote'
import type { Wallet } from '@/contracts/wallet'
import { applyApiErrorToForm } from '@/features/auth'
import { cartKeys, quoteKeys, requestQuote, useCartScope, useCartUiStore, useQuote } from '@/features/cart'
import { forgetAttempt, recallAttempt, rememberAttempt, useCreateOrder } from '@/features/orders'
import { isApiError } from '@/lib/api-error'
import { prefillFrom, walletFields } from './checkout.rules'
import { clearDraft, loadDraft, saveDraft } from './draft'
import { type CheckoutForm, type CheckoutFormOutput, checkoutFormSchema } from './schemas'
import { useWalletSim } from './wallet-sim'

const DRAFT_DEBOUNCE_MS = 500

export interface OutdatedQuote {
  previous: Quote
  fresh: Quote
  values: CheckoutFormOutput
}

export interface SubmitError {
  message: string
  retry?: () => void
}

const customerField = (name: string) => name.replace(/^customer\./, '')

export function useCheckoutFlow({ user, wallets }: { user: PublicUser; wallets: Wallet[] }) {
  const userId = user.id
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const scope = useCartScope()
  const primary = wallets.find((w) => w.kind === 'primary') ?? wallets[0]
  const [draft] = useState(() => loadDraft(userId))
  const form = useForm({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: prefillFrom(user, primary, draft),
  })
  const [couponDraft, setCouponDraft] = useState('')
  const [couponCode, setCouponCode] = useState<string | null>(null)
  const quote = useQuote(couponCode, true)
  const walletSim = useWalletSim()
  const createOrder = useCreateOrder()
  const priceChanges = useCartUiStore((s) => s.priceChanges)
  const acknowledgePriceChanges = useCartUiStore((s) => s.acknowledge)
  const [outdated, setOutdated] = useState<OutdatedQuote | null>(null)
  const [submitError, setSubmitError] = useState<SubmitError | null>(null)
  const [revalidating, setRevalidating] = useState(false)
  const [useOtherWallet, setUseOtherWallet] = useState(wallets.length === 0 || Boolean(draft && draft.walletId && draft.walletId !== primary?.id))
  const submitting = useRef(false)

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const unsubscribe = form.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => saveDraft(userId, values as Partial<CheckoutForm>), DRAFT_DEBOUNCE_MS)
      },
    })
    return () => {
      unsubscribe()
      if (timer.current) clearTimeout(timer.current)
    }
  }, [form, userId])

  const selectWallet = (wallet: Wallet) => {
    for (const [name, value] of Object.entries(walletFields(wallet))) {
      form.setValue(name as keyof CheckoutForm, value, { shouldDirty: true, shouldValidate: true })
    }
  }

  const buildBody = (target: Quote, values: CheckoutFormOutput): CreateOrder => {
    const { walletId, ...customer } = values
    return { quoteId: target.quoteId, quoteVersion: target.version, walletId, network: values.network, customer }
  }

  const submitOrder = async (target: Quote, values: CheckoutFormOutput) => {
    setSubmitError(null)
    const attempt = recallAttempt(userId, target.fingerprint) ?? { key: crypto.randomUUID(), body: buildBody(target, values) }
    rememberAttempt(userId, target.fingerprint, attempt)
    try {
      const order = await createOrder.mutateAsync({ body: attempt.body, idempotencyKey: attempt.key })
      forgetAttempt(userId, target.fingerprint)
      clearDraft(userId)
      acknowledgePriceChanges()
      void queryClient.invalidateQueries({ queryKey: cartKeys.all })
      await navigate({ to: '/orders/$orderId', params: { orderId: order.id } })
    } catch (error) {
      if (isApiError(error) && (error.code === 'QUOTE_OUTDATED' || error.code === 'IDEMPOTENCY_CONFLICT')) {
        forgetAttempt(userId, target.fingerprint)
        const fresh = (error.details as { quote?: Quote } | undefined)?.quote
        if (fresh) {
          queryClient.setQueryData(quoteKeys.for(scope, couponCode), fresh)
          setOutdated({ previous: target, fresh, values })
        } else {
          setSubmitError({ message: error.message })
          void queryClient.invalidateQueries({ queryKey: quoteKeys.all })
        }
        return
      }
      if (isApiError(error) && error.status === 422 && error.fields) {
        forgetAttempt(userId, target.fingerprint)
        applyApiErrorToForm(form, error, customerField)
        setSubmitError({ message: error.message })
        return
      }
      const message = error instanceof Error ? error.message : 'Não foi possível concluir o pedido.'
      const retryable = isApiError(error) ? error.retryable : true
      setSubmitError({ message, retry: retryable ? () => void submitOrder(target, values) : undefined })
    }
  }

  const confirmValid = form.handleSubmit(async (values) => {
    setSubmitError(null)
    if (walletSim.status !== 'connected') {
      setSubmitError({ message: 'Conecte uma carteira para confirmar a compra.' })
      return
    }
    const shown = quote.data
    if (!shown) return
    setRevalidating(true)
    let fresh: Quote
    try {
      fresh = await requestQuote(couponCode)
    } catch (error) {
      if (isApiError(error) && error.code === 'AVAILABILITY_CONFLICT') {
        await queryClient.refetchQueries({ queryKey: quoteKeys.for(scope, couponCode) })
        setRevalidating(false)
        return
      }
      setRevalidating(false)
      setSubmitError({ message: error instanceof Error ? error.message : 'Não foi possível revalidar a cotação.' })
      return
    }
    setRevalidating(false)
    queryClient.setQueryData(quoteKeys.for(scope, couponCode), fresh)
    if (fresh.fingerprint !== shown.fingerprint || priceChanges.length > 0) {
      acknowledgePriceChanges()
      setOutdated({ previous: shown, fresh, values })
      return
    }
    await submitOrder(fresh, values)
  })

  const confirm = async (event?: React.BaseSyntheticEvent) => {
    event?.preventDefault()
    if (submitting.current) return
    submitting.current = true
    try {
      await confirmValid(event)
    } finally {
      submitting.current = false
    }
  }

  const confirmOutdated = async () => {
    if (!outdated || submitting.current) return
    const { fresh, values } = outdated
    setOutdated(null)
    submitting.current = true
    try {
      await submitOrder(fresh, values)
    } finally {
      submitting.current = false
    }
  }

  const couponError = isApiError(quote.error) && quote.error.fields?.couponCode ? quote.error.fields.couponCode : null
  const availabilityError = isApiError(quote.error) && quote.error.code === 'AVAILABILITY_CONFLICT' ? quote.error.message : null

  return {
    form,
    wallets,
    primary,
    useOtherWallet,
    setUseOtherWallet: (value: boolean) => {
      setUseOtherWallet(value)
      if (!value && primary) selectWallet(primary)
    },
    selectWallet,
    quote,
    couponDraft,
    setCouponDraft,
    appliedCoupon: quote.data?.coupon?.code ?? null,
    couponError,
    availabilityError,
    applyCoupon: () => setCouponCode(couponDraft.trim().toUpperCase() || null),
    removeCoupon: () => {
      setCouponCode(null)
      setCouponDraft('')
    },
    walletSim,
    priceChanges,
    refreshSummary: () => {
      acknowledgePriceChanges()
      void queryClient.invalidateQueries({ queryKey: quoteKeys.all })
    },
    outdated,
    dismissOutdated: () => setOutdated(null),
    confirmOutdated,
    confirm,
    submitError,
    submitting: createOrder.isPending || revalidating,
    canConfirm: Boolean(quote.data) && !availabilityError && walletSim.status === 'connected' && !createOrder.isPending && !revalidating,
    notifyWalletRequired: () => toast.info('Escolha uma carteira e aguarde a conexão.', { id: 'wallet-required' }),
  }
}

export type CheckoutFlow = ReturnType<typeof useCheckoutFlow>
