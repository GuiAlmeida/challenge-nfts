import { Link, useRouterState } from '@tanstack/react-router'
import { cn } from 'cn'
import { HomeIcon, ScanIcon, ShopIcon, TabbarHeartIcon, UserOutlineIcon } from '@/assets/icons'
import { Icon } from './icon'
import { notifyOutOfScope } from './out-of-scope'

export function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const item = (active: boolean) =>
    cn(
      'flex size-12 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring',
      active ? 'text-brand' : 'text-sand hover:text-brand',
    )
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[max(env(safe-area-inset-bottom),12px)] md:hidden"
    >
      <div className="relative mx-auto flex h-18 max-w-103.5 items-center justify-between px-6">
        <Link to="/" aria-label="Início" aria-current={pathname === '/' ? 'page' : undefined} className={item(pathname === '/')}>
          <Icon icon={HomeIcon} size={24} />
        </Link>
        <button
          type="button"
          aria-label="Lista de interesse"
          aria-disabled="true"
          onClick={() => notifyOutOfScope('Lista de interesse')}
          className={item(false)}
        >
          <Icon icon={TabbarHeartIcon} size={22} />
        </button>
        <button
          type="button"
          aria-label="Escanear NFT"
          aria-disabled="true"
          onClick={() => notifyOutOfScope('Escanear')}
          className="-mt-10 flex size-16.25 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_10px_rgba(10,6,4,0.45)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <Icon icon={ScanIcon} size={28} />
        </button>
        <Link to="/cart" aria-label="Carrinho" aria-current={pathname === '/cart' ? 'page' : undefined} className={item(pathname === '/cart')}>
          <Icon icon={ShopIcon} size={22} />
        </Link>
        <Link
          to="/account/profile"
          aria-label="Conta"
          aria-current={pathname.startsWith('/account') ? 'page' : undefined}
          className={item(pathname.startsWith('/account'))}
        >
          <Icon icon={UserOutlineIcon} size={22} />
        </Link>
      </div>
    </nav>
  )
}
