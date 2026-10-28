import { useId } from 'react'
import { fieldInputClass } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormRootMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { PublicUser } from '@/contracts/auth'
import { PasswordInput, useSessionUser } from '@/features/auth'
import { useAvatarFlow } from '../use-avatar-flow'
import { useProfileFlow } from '../use-profile-flow'
import { AvatarField } from './avatar-field'

function ProfileForm({ user }: { user: PublicUser }) {
  const flow = useProfileFlow(user)
  const avatar = useAvatarFlow()
  const titleId = useId()
  const passwordTitleId = useId()
  const { form } = flow
  return (
    <Form {...form}>
      <form onSubmit={flow.submit} noValidate aria-labelledby={titleId} className="flex flex-col gap-10">
        <div className="flex flex-col gap-7">
          <h1 id={titleId} className="text-base leading-5 font-bold text-foreground">
            Perfil do colecionador
          </h1>
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Nome de usuário</FormLabel>
                  <FormControl>
                    <Input autoComplete="username" spellCheck={false} className={fieldInputClass} {...field} />
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
            <FormField
              control={form.control}
              name="walletAlias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apelido da carteira (opcional)</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" className={fieldInputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AvatarField user={user} flow={avatar} />
          </div>
        </div>

        <section aria-labelledby={passwordTitleId} className="grid grid-cols-1 gap-7 md:grid-cols-2">
          <div className="flex flex-col gap-7">
            <h2 id={passwordTitleId} className="text-base leading-5 font-bold text-foreground">
              Alterar senha
            </h2>
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha atual</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete="current-password" className={fieldInputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova senha</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete="new-password" className={fieldInputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar nova senha</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete="new-password" className={fieldInputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <div className="flex flex-col gap-3">
          <FormRootMessage />
          <Button type="submit" size="sm" radius="xs" className="min-w-32.75 self-start px-6 text-sm" disabled={flow.pending}>
            {flow.pending ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export function ProfilePage() {
  const user = useSessionUser()
  if (!user) return null
  return <ProfileForm key={user.id} user={user} />
}
