import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { cn } from 'cn'
import { useId, useState } from 'react'
import { LoginIcon, SearchIcon } from '@/assets/icons'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import type { PublicUser } from '@/contracts/auth'
import { Icon } from './icon'
import { activeNavFor, headerHasDivider } from './nav'
import { notifyOutOfScope } from './out-of-scope'
import { PageContainer } from './page-container'

export function AppHeader({ user, cart, onLogout }: { user: PublicUser | null; cart: React.ReactNode; onLogout?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const active = activeNavFor(pathname)
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchId = useId()

  const submit = () => {
    const q = query.trim()
    void navigate({ to: '/', search: (prev) => ({ ...prev, q: q || undefined, page: 1 }) })
    setSearchOpen(false)
  }
  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    submit()
  }

  return (
    <header className={cn('hidden pt-6 md:block', headerHasDivider(pathname) && 'border-b border-border')}>
      <PageContainer className="flex h-11.25 items-start justify-between pb-0">
        <Link
          to="/"
          className="flex h-8.5 w-40 items-center font-mono text-sm font-bold tracking-[1.4px] text-foreground"
          aria-label="Kurio, página inicial"
        >
          KURIO
        </Link>

        <nav aria-label="Principal" className="flex gap-5 self-stretch lg:gap-10">
          <NavItem to="/" active={active === 'home'}>
            Início
          </NavItem>
          <NavItem to="/" hash="catalogo" active={active === 'market'}>
            Mercado
          </NavItem>
          <NavButton onClick={() => notifyOutOfScope('Criadores')}>Criadores</NavButton>
          <NavButton onClick={() => notifyOutOfScope('Aprenda')}>Aprenda</NavButton>
        </nav>

        <div className="flex items-center gap-4 lg:gap-7">
          <form role="search" onSubmit={submitSearch} className="flex items-center gap-2">
            {searchOpen ? (
              <Input
                id={searchId}
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchOpen(false)
                }}
                placeholder="Buscar NFTs…"
                aria-label="Buscar NFTs"
                className="h-8.75 w-55"
              />
            ) : null}
            <button
              type="button"
              onClick={() => (searchOpen ? submit() : setSearchOpen(true))}
              aria-label={searchOpen ? 'Buscar' : 'Abrir busca'}
              aria-expanded={searchOpen}
              aria-controls={searchId}
              className="rounded-sm text-foreground outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon icon={SearchIcon} size={20} />
            </button>
          </form>

          {cart}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="primary"
                  size="xs"
                  className="w-auto gap-1 px-3 font-medium lg:w-25 lg:px-2"
                  aria-label={`Conta de ${user.displayName}`}
                >
                  <Icon icon={LoginIcon} size={20} />
                  <span className="truncate">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-50 font-mono">
                <DropdownMenuItem asChild>
                  <Link to="/account/profile">Dados do perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/wallets">Carteiras</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => onLogout?.()}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="primary" size="xs" className="w-auto gap-1 px-3 font-medium lg:w-25 lg:px-2">
              <Link to="/login">
                <Icon icon={LoginIcon} size={20} />
                Entrar
              </Link>
            </Button>
          )}
        </div>
      </PageContainer>
    </header>
  )
}

function NavItem({ to, hash, active, children }: { to: '/'; hash?: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      hash={hash}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex flex-col justify-between border-b-2 pb-0 font-mono text-base leading-none outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active ? 'border-primary font-bold text-brand' : 'border-transparent font-normal text-foreground hover:text-brand',
      )}
    >
      <span className="pt-1">{children}</span>
    </Link>
  )
}

function NavButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-disabled="true"
      title="Fora do escopo desta demonstração"
      className="flex flex-col justify-start border-b-2 border-transparent pt-1 font-mono text-base leading-none text-foreground outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  )
}
