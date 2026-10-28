import { Link } from '@tanstack/react-router'
import { useRef } from 'react'
import { CartIcon } from '@/assets/icons'
import { Icon, NftImage, Price } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { useCartUiStore } from '../cart-ui-store'
import { useCart } from '../queries/use-cart'

export function MiniCart() {
  const cart = useCart()
  const open = useCartUiStore((s) => s.miniCartOpen)
  const setOpen = useCartUiStore((s) => s.setMiniCartOpen)
  const count = cart.data?.itemCount ?? 0
  const items = cart.data?.items ?? []
  const subtotal = cart.data?.subtotal ?? '0'
  const availabilityIssue = items.some((item) => item.available < item.quantity)
  const announcement = useCartUiStore((s) => s.announcement)
  const close = () => setOpen(false)
  const closeTimer = useRef<number | undefined>(undefined)
  const openedByHover = useRef(false)
  const closedByHover = useRef(false)
  const cancelClose = () => window.clearTimeout(closeTimer.current)
  const openOnHover = (event: React.PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    cancelClose()
    if (open) return
    openedByHover.current = true
    setOpen(true)
  }
  const closeOnLeave = (event: React.PointerEvent) => {
    if (event.pointerType !== 'mouse' || !openedByHover.current) return
    cancelClose()
    closeTimer.current = window.setTimeout(() => {
      openedByHover.current = false
      closedByHover.current = true
      setOpen(false)
    }, 200)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) openedByHover.current = false
        setOpen(next)
      }}
    >
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
      <PopoverTrigger
        data-cart-anchor
        onPointerEnter={openOnHover}
        onPointerLeave={closeOnLeave}
        onClick={(event) => {
          if (!openedByHover.current) return
          event.preventDefault()
          cancelClose()
          openedByHover.current = false
        }}
        aria-label={count > 0 ? `Carrinho, ${count} itens` : 'Carrinho'}
        className="relative rounded-sm text-foreground outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:text-brand"
      >
        <Icon icon={CartIcon} size={24} />
        {count > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -top-1 left-3.75 flex size-4 items-center justify-center rounded-full bg-primary font-mono text-[10px] leading-none font-medium text-primary-foreground"
          >
            {count > 99 ? '99+' : count}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={12}
        aria-label="Resumo do carrinho"
        onPointerEnter={openOnHover}
        onPointerLeave={closeOnLeave}
        onOpenAutoFocus={(event) => {
          if (openedByHover.current) event.preventDefault()
        }}
        onCloseAutoFocus={(event) => {
          if (!closedByHover.current) return
          event.preventDefault()
          closedByHover.current = false
        }}
        className="flex w-72 flex-col gap-4 border-border bg-card p-4 font-mono"
      >
        <p className="text-[15px] leading-4 font-bold text-foreground">Seu carrinho{count > 0 ? ` (${count})` : ''}</p>
        {cart.isPending ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm leading-6 text-sand">Seu carrinho está vazio.</p>
        ) : (
          <>
            <ul className="-mr-2 flex max-h-72 flex-col gap-3 overflow-y-auto pr-2">
              {items.map((item) => (
                <li key={item.id} className="flex items-start gap-2.5">
                  <Link
                    to="/nft/$nftId"
                    params={{ nftId: item.nftId }}
                    onClick={close}
                    className="shrink-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <NftImage image={item.image} width={56} height={56} sizes="56px" className="size-14 rounded-sm" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="truncate text-[13px] leading-4 font-bold text-foreground">{item.name}</p>
                    <p className="truncate text-xs leading-4 text-sand">
                      Edição {item.editionLabel} · Qtd. {item.quantity}
                    </p>
                    {item.available < item.quantity ? (
                      <p className="text-xs leading-4 text-coral">{item.available === 0 ? 'Esgotado' : `Só ${item.available} disponíveis`}</p>
                    ) : null}
                    <Price value={item.lineTotal} size="sm" className="text-[13px]" />
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm leading-4 text-sand">Subtotal</span>
              <Price value={subtotal} size="sm" tone="foreground" />
            </div>
            {availabilityIssue ? <p className="text-xs leading-4 text-coral">Revise as quantidades no carrinho antes de comprar.</p> : null}
          </>
        )}
        <div className="flex flex-col gap-2">
          {items.length > 0 && !availabilityIssue ? (
            <Button asChild size="sm" radius="xs" className="w-full text-sm">
              <Link to="/checkout" onClick={close}>
                Comprar
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" size="sm" radius="xs" className="w-full text-sm">
            <Link to="/cart" onClick={close}>
              Ver carrinho
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
