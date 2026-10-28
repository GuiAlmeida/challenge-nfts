import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import {
  ActivityIcon,
  AlertTriangleIcon,
  DownloadIcon,
  HeartOutlineIcon,
  LocationIcon,
  LogoutIcon,
  ShoppingIcon,
  UserIcon,
} from '@/assets/icons'
import { Icon, type IconComponent, notifyOutOfScope, PageContainer } from '@/components/layout'
import { useLogout } from '@/features/auth'

interface AccountLink {
  label: string
  icon: IconComponent
  to: '/account/profile' | '/account/wallets'
}

const LINKS: AccountLink[] = [
  { label: 'Dados do perfil', icon: UserIcon, to: '/account/profile' },
  { label: 'Carteiras', icon: LocationIcon, to: '/account/wallets' },
]

const OUT_OF_SCOPE: Array<{ label: string; icon: IconComponent }> = [
  { label: 'Atividade', icon: ShoppingIcon },
  { label: 'Lista de interesse', icon: HeartOutlineIcon },
  { label: 'Ofertas', icon: ActivityIcon },
  { label: 'Arquivos baixados', icon: DownloadIcon },
  { label: 'Suporte', icon: AlertTriangleIcon },
]

const sidebarItem =
  'relative flex h-11.25 w-full items-center gap-3 px-4 text-left font-mono text-[15px] leading-5 text-brand outline-none hover:bg-surface-raised focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'

function AccountSidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <nav aria-label="Minha conta" className="hidden w-77.5 shrink-0 flex-col bg-card pb-2 lg:flex">
      <p className="px-4 pt-5 pb-2 font-mono text-lg leading-6 font-bold text-foreground">Meu perfil</p>
      <ul className="flex flex-col">
        {LINKS.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={cn(
                sidebarItem,
                'data-[status=active]:before:absolute data-[status=active]:before:inset-y-0 data-[status=active]:before:left-0 data-[status=active]:before:w-1.5 data-[status=active]:before:bg-primary',
              )}
            >
              <Icon icon={link.icon} size={18} />
              {link.label}
            </Link>
          </li>
        ))}
        {OUT_OF_SCOPE.map((item) => (
          <li key={item.label}>
            <button
              type="button"
              aria-disabled="true"
              title="Fora do escopo desta demonstração"
              onClick={() => notifyOutOfScope(item.label)}
              className={sidebarItem}
            >
              <Icon icon={item.icon} size={18} />
              {item.label}
            </button>
          </li>
        ))}
        <li className="mt-1 border-t border-border">
          <button type="button" onClick={onLogout} className={cn(sidebarItem, 'font-bold')}>
            <Icon icon={LogoutIcon} size={18} />
            Sair
          </button>
        </li>
      </ul>
    </nav>
  )
}

function AccountTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <nav aria-label="Minha conta" className="flex flex-col gap-4 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-lg leading-6 font-bold text-foreground">Meu perfil</p>
        <button
          type="button"
          onClick={onLogout}
          className="flex h-9 items-center gap-2 rounded-xs px-1 font-mono text-sm font-bold text-brand outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon icon={LogoutIcon} size={16} />
          Sair
        </button>
      </div>
      <ul className="grid grid-cols-2 rounded-pill border border-border p-1">
        {LINKS.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="flex h-9 items-center justify-center gap-2 rounded-pill px-3 font-mono text-sm whitespace-nowrap text-sand outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[status=active]:bg-surface-raised data-[status=active]:font-bold data-[status=active]:text-brand"
            >
              <Icon icon={link.icon} size={16} />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function AccountLayout({ children }: { children: React.ReactNode }) {
  const logout = useLogout()
  const onLogout = () => void logout()
  return (
    <PageContainer className="flex flex-col gap-8 pt-6 pb-16 md:pt-8 lg:flex-row lg:items-start lg:gap-7">
      <AccountSidebar onLogout={onLogout} />
      <AccountTabs onLogout={onLogout} />
      <div className="min-w-0 flex-1">{children}</div>
    </PageContainer>
  )
}
