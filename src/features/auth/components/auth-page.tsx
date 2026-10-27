import { Link } from '@tanstack/react-router'
import { AuthForm, type AuthMode } from './auth-form'
import { SocialButtons } from './social-buttons'

export function AuthPage({ mode, redirect }: { mode: AuthMode; redirect: string | undefined }) {
  const login = mode === 'login'
  return (
    <div className="flex min-h-svh flex-col gap-10 px-7 pt-20 pb-6">
      <p className="flex h-34 items-center justify-center text-[32px] font-bold tracking-[3.2px] text-foreground">KURIO</p>
      <h1 className="text-center leading-4 font-bold text-foreground">
        <span className={login ? 'text-xl' : 'text-lg'}>{login ? 'Entrar' : 'Criar perfil de colecionador'}</span>
      </h1>
      <AuthForm mode={mode} variant="page" redirect={redirect} />
      <SocialButtons gap="gap-4" />
      <p className="text-center text-[15px] text-sand">
        {login ? 'Novo na Kurio? ' : 'Já tem uma conta? '}
        <Link
          to={login ? '/register' : '/login'}
          search={{ redirect }}
          replace
          className="rounded-xs text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {login ? 'Crie uma conta' : 'Entre'}
        </Link>
      </p>
    </div>
  )
}
