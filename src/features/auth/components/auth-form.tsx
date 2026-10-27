import { cn } from 'cn'
import { notifyOutOfScope } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useLoginFlow } from '../use-login-flow'
import { useRegisterFlow } from '../use-register-flow'
import { PasswordInput } from './password-input'

export type AuthMode = 'login' | 'register'
export type AuthVariant = 'dialog' | 'page'

const INPUT: Record<AuthVariant, string> = {
  dialog: 'h-10 rounded-[5px] px-4',
  page: 'h-12.5 rounded-[10px] px-4',
}

function RootError({ message }: { message: string | undefined }) {
  if (!message) return null
  return (
    <p role="alert" className="text-[13px] leading-4 text-coral">
      {message}
    </p>
  )
}

function LoginForm({ variant, redirect }: { variant: AuthVariant; redirect: string | undefined }) {
  const { form, submit, pending } = useLoginFlow(redirect)
  const input = INPUT[variant]
  return (
    <Form {...form}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">E-mail</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="contato@email.com" className={input} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Senha</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="current-password" placeholder="Senha" className={input} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <RootError message={form.formState.errors.root?.message} />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => notifyOutOfScope('Recuperação de senha')}
            aria-disabled="true"
            className="rounded-xs text-sm leading-4 text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            Esqueceu a senha?
          </button>
        </div>
        <Button
          type="submit"
          disabled={pending}
          size={variant === 'dialog' ? 'md' : 'lg'}
          className={cn('mt-3 w-full', variant === 'dialog' ? 'rounded-[5px]' : 'rounded-[10px] px-0')}
        >
          {pending ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </Form>
  )
}

function RegisterForm({ variant, redirect }: { variant: AuthVariant; redirect: string | undefined }) {
  const { form, submit, pending } = useRegisterFlow(redirect)
  const input = INPUT[variant]
  return (
    <Form {...form}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-3">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Nome de usuário</FormLabel>
              <FormControl>
                <Input autoComplete="username" placeholder="Nome de usuário" className={input} {...field} />
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
              <FormLabel className="sr-only">E-mail</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="Digite seu e-mail" className={input} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Senha</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" placeholder="Senha" className={input} {...field} />
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
              <FormLabel className="sr-only">Confirmar senha</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" placeholder="Confirmar senha" className={input} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <RootError message={form.formState.errors.root?.message} />
        <Button
          type="submit"
          disabled={pending}
          size={variant === 'dialog' ? 'md' : 'lg'}
          className={cn('mt-3 w-full', variant === 'dialog' ? 'rounded-[5px]' : 'rounded-[10px] px-0')}
        >
          {pending ? 'Criando…' : variant === 'dialog' ? 'Criar conta' : 'Criar perfil'}
        </Button>
      </form>
    </Form>
  )
}

export function AuthForm({ mode, variant, redirect }: { mode: AuthMode; variant: AuthVariant; redirect: string | undefined }) {
  return mode === 'login' ? <LoginForm variant={variant} redirect={redirect} /> : <RegisterForm variant={variant} redirect={redirect} />
}
