import { Link, useNavigate } from '@tanstack/react-router'
import { cn } from 'cn'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { safeRedirect } from '../redirect'
import { AuthForm, type AuthMode } from './auth-form'
import { SocialButtons } from './social-buttons'

const COPY: Record<AuthMode, { title: string; subtitle: string }> = {
  login: { title: 'Entrar', subtitle: 'Entre para gerenciar sua carteira, coleção e perfil de criador.' },
  register: { title: 'Criar conta', subtitle: 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.' },
}

function ModeToggle({ mode, redirect }: { mode: AuthMode; redirect: string | undefined }) {
  const item = (target: AuthMode, label: string) => (
    <Link
      to={target === 'login' ? '/login' : '/register'}
      search={{ redirect }}
      replace
      aria-current={mode === target ? 'page' : undefined}
      className={cn(
        'rounded-xs text-xl leading-4 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring',
        mode === target ? 'text-brand' : 'text-foreground hover:text-brand',
      )}
    >
      {label}
    </Link>
  )
  return (
    <nav aria-label="Entrar ou criar conta" className="flex items-center gap-2">
      {item('login', 'Entrar')}
      <span aria-hidden="true" className="h-4 w-px bg-coral" />
      {item('register', 'Criar conta')}
    </nav>
  )
}

export function AuthDialog({ mode, redirect }: { mode: AuthMode; redirect: string | undefined }) {
  const navigate = useNavigate()
  const copy = COPY[mode]
  return (
    <Dialog open onOpenChange={(open) => !open && void navigate({ href: safeRedirect(redirect) })}>
      <DialogContent className="w-125 max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-lg border-0 bg-card p-0 sm:max-w-125">
        <div className="flex flex-col items-center gap-10 px-12 pt-12">
          <DialogTitle className="sr-only">{copy.title}</DialogTitle>
          <ModeToggle mode={mode} redirect={redirect} />
          <DialogDescription className="text-center text-[13px] leading-4 text-foreground">{copy.subtitle}</DialogDescription>
        </div>
        <div className="px-20 pt-6">
          <AuthForm mode={mode} variant="dialog" redirect={redirect} />
        </div>
        <SocialButtons className="px-20 pt-6 pb-10" />
        <div aria-hidden="true" className="h-2.5 w-full bg-primary" />
      </DialogContent>
    </Dialog>
  )
}
