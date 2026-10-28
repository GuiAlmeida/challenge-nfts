import { cn } from 'cn'
import { useWatch } from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { NETWORK_LABEL, networkSchema, WALLET_PROVIDER_LABEL, walletProviderSchema } from '@/contracts/common'
import type { CheckoutFlow } from '../use-checkout-flow'
import { WalletCards } from './wallet-cards'

const field = 'h-10 rounded-xs px-3 text-sm'
const trigger =
  'h-10 w-full rounded-xs border-input bg-transparent px-3 text-sm shadow-none dark:bg-transparent dark:hover:bg-transparent data-[placeholder]:text-muted-foreground'

export function CollectorForm({ flow, className }: { flow: CheckoutFlow; className?: string }) {
  const { form } = flow
  const network = useWatch({ control: form.control, name: 'network' })
  const walletId = useWatch({ control: form.control, name: 'walletId' })
  return (
    <Form {...form}>
      <form id="checkout-form" onSubmit={flow.confirm} noValidate className={cn('flex flex-col gap-7', className)}>
        <h2 className="text-base leading-4 font-bold text-foreground">Perfil do colecionador</h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel required>Nome de exibição</FormLabel>
                <FormControl>
                  <Input autoComplete="name" className={field} {...f} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel required>Nome de usuário</FormLabel>
                <FormControl>
                  <Input autoComplete="username" className={field} {...f} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="network"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel required>Rede</FormLabel>
                <Select value={f.value} onValueChange={f.onChange}>
                  <FormControl>
                    <SelectTrigger className={trigger} aria-label="Rede">
                      <SelectValue placeholder="Selecione uma rede" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent position="popper">
                    {networkSchema.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {NETWORK_LABEL[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="profileName"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel required>Nome do perfil</FormLabel>
                <FormControl>
                  <Input className={field} {...f} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="walletAddress"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel required>Endereço da carteira</FormLabel>
                <FormControl>
                  <Input placeholder="Endereço 0x da carteira" spellCheck={false} className={field} {...f} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="secondaryAddress"
            render={({ field: f }) => (
              <FormItem className="md:pt-7">
                <FormLabel className="sr-only">ENS ou carteira secundária (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="ENS ou carteira secundária (opcional)" spellCheck={false} className={field} {...f} value={f.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="walletProvider"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel required>Tipo de carteira</FormLabel>
                <Select value={f.value} onValueChange={f.onChange}>
                  <FormControl>
                    <SelectTrigger className={trigger} aria-label="Tipo de carteira">
                      <SelectValue placeholder="Selecione uma carteira" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent position="popper">
                    {walletProviderSchema.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {WALLET_PROVIDER_LABEL[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="referralCode"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Código de indicação (opcional)</FormLabel>
                <FormControl>
                  <Input className={field} {...f} value={f.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field: f }) => (
              <FormItem>
                <FormLabel required>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" className={field} {...f} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {network === 'ethereum' ? (
            <FormField
              control={form.control}
              name="ens"
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>Nome ENS (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="nome.eth" spellCheck={false} className={field} {...f} value={f.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex w-fit cursor-pointer items-center gap-2 text-[15px] leading-5 text-foreground">
            <Checkbox
              checked={flow.useOtherWallet}
              onCheckedChange={(checked) => flow.setUseOtherWallet(checked === true)}
              className="size-[15px] rounded-full border-primary"
            />
            Usar outra carteira?
          </label>
          {flow.useOtherWallet || flow.wallets.length === 0 ? (
            <WalletCards wallets={flow.wallets} selectedId={walletId} onSelect={flow.selectWallet} />
          ) : null}
          {form.formState.errors.walletId ? (
            <p role="alert" className="text-sm text-coral">
              {form.formState.errors.walletId.message}
            </p>
          ) : null}
        </div>

        <FormField
          control={form.control}
          name="note"
          render={({ field: f }) => (
            <FormItem className="max-w-87.5">
              <FormLabel>Observação do colecionador (opcional)</FormLabel>
              <FormControl>
                <Textarea rows={6} className="min-h-38 rounded-xs border-input bg-transparent text-sm" {...f} value={f.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
