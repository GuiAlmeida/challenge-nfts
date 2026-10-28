import { Link, useRouterState } from '@tanstack/react-router'
import { cn } from 'cn'
import { HomeIcon, ScanIcon, ShopIcon, TabbarHeartIcon, UserOutlineIcon } from '@/assets/icons'
import { Icon } from './icon'
import { notifyOutOfScope } from './out-of-scope'

const NOTCH_PATH =
  'M160 40H161.15C174.9 40 187.13 48.2 192.98 60.65C200.74 77.18 217.54 88.62 237 88.62C256.46 88.62 273.26 77.17 281.02 60.65C286.87 48.2 299.09 40 312.85 40H314V134.95H160Z'

const itemClass = (active: boolean) =>
  cn(
    'flex size-12 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring',
    active ? 'text-brand' : 'text-sand hover:text-brand',
  )

export function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const inAccount = pathname.startsWith('/account')
  return (
    <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-40 drop-shadow-[0_-10px_30px_rgba(10,6,4,0.45)] md:hidden">
      <div className="relative h-23.75">
        <div aria-hidden="true" className="absolute inset-0 flex">
          <span className="flex-1 rounded-tl-[29px] bg-card" />
          <svg viewBox="160 40 154 94.95" preserveAspectRatio="none" className="-mx-px h-full w-38.5 shrink-0 text-card">
            <path d={NOTCH_PATH} fill="currentColor" />
          </svg>
          <span className="flex-1 rounded-tr-[29px] bg-card" />
        </div>
        <div className="relative flex h-full items-start justify-between pt-6.5">
          <div className="flex gap-6 pl-5.5">
            <Link to="/" aria-label="Início" aria-current={pathname === '/' ? 'page' : undefined} className={itemClass(pathname === '/')}>
              <Icon icon={HomeIcon} size={20} />
            </Link>
            <button
              type="button"
              aria-label="Lista de interesse"
              aria-disabled="true"
              onClick={() => notifyOutOfScope('Lista de interesse')}
              className={itemClass(false)}
            >
              <Icon icon={TabbarHeartIcon} size={20} />
            </button>
          </div>
          <div className="flex gap-3.5 pr-6.5">
            <Link to="/cart" aria-label="Carrinho" aria-current={pathname === '/cart' ? 'page' : undefined} className={itemClass(pathname === '/cart')}>
              <Icon icon={ShopIcon} size={20} />
            </Link>
            <Link to="/account/profile" aria-label="Conta" aria-current={inAccount ? 'page' : undefined} className={itemClass(inAccount)}>
              <Icon icon={UserOutlineIcon} size={20} />
            </Link>
          </div>
        </div>
        <button
          type="button"
          aria-label="Escanear NFT"
          aria-disabled="true"
          onClick={() => notifyOutOfScope('Escanear')}
          className="absolute -top-7.75 left-1/2 flex size-16.25 -translate-x-1/2 items-center justify-center rounded-full bg-background bg-linear-to-b from-primary/50 to-primary/95 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <Icon icon={ScanIcon} size={27} />
        </button>
      </div>
      <div className="h-[env(safe-area-inset-bottom)] bg-card" />
    </nav>
  )
}
