import { fieldInputClass, fieldSelectTriggerClass } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormRootMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NETWORK_LABEL, networkSchema, WALLET_PROVIDER_LABEL, walletProviderSchema } from '@/contracts/common'
import type { WalletFlow } from '../use-wallet-flow'

export function WalletForm({ flow, label }: { flow: WalletFlow; label: string }) {
  const { form } = flow
  return (
    <Form {...form}>
      <form onSubmit={flow.submit} noValidate aria-label={label} className="flex flex-col gap-7">
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Nome de exibição</FormLabel>
                <FormControl>
                  <Input autoComplete="name" className={fieldInputClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="alias"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Apelido da carteira</FormLabel>
                <FormControl>
                  <Input autoComplete="off" className={fieldInputClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="network"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Rede</FormLabel>
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger ref={field.ref} onBlur={field.onBlur} className={fieldSelectTriggerClass}>
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
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Nome do perfil</FormLabel>
                <FormControl>
                  <Input className={fieldInputClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Endereço da carteira</FormLabel>
                <FormControl>
                  <Input placeholder="Endereço 0x da carteira" spellCheck={false} autoComplete="off" className={fieldInputClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="secondaryAddress"
            render={({ field }) => (
              <FormItem className="md:pt-5.75">
                <FormLabel className="sr-only">ENS ou carteira secundária (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="ENS ou carteira secundária (opcional)" spellCheck={false} autoComplete="off" className={fieldInputClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Tipo de carteira</FormLabel>
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger ref={field.ref} onBlur={field.onBlur} className={fieldSelectTriggerClass}>
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de indicação (opcional)</FormLabel>
                <FormControl>
                  <Input autoComplete="off" className={fieldInputClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" className={fieldInputClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {flow.network === 'ethereum' ? (
            <FormField
              control={form.control}
              name="ens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome ENS (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="nome.eth" spellCheck={false} autoComplete="off" className={fieldInputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
        </div>
        <FormRootMessage />
        <Button type="submit" size="sm" radius="xs" className="min-w-32.75 self-start px-6 text-sm" disabled={flow.pending}>
          {flow.pending ? 'Salvando…' : 'Salvar carteira'}
        </Button>
      </form>
    </Form>
  )
}
