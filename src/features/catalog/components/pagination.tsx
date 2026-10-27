import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { ArrowRightPaginationIcon } from '@/assets/icons'
import { Icon } from '@/components/layout'
import { pageWindow, patchSearch } from '../catalog.rules'

const box =
  'flex size-8.75 items-center justify-center rounded-sm text-lg leading-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null
  const pages = pageWindow(page, totalPages)
  const prevDisabled = page <= 1
  const nextDisabled = page >= totalPages
  return (
    <nav aria-label="Paginação" className="flex justify-center md:justify-end">
      <ul className="flex items-center gap-2">
        <li>
          <Link
            to="/"
            search={(prev) => patchSearch(prev, { page: Math.max(1, page - 1) })}
            resetScroll={false}
            aria-label="Página anterior"
            aria-disabled={prevDisabled || undefined}
            tabIndex={prevDisabled ? -1 : undefined}
            className={cn(box, 'border border-border text-foreground', prevDisabled && 'pointer-events-none opacity-40')}
          >
            <Icon icon={ArrowRightPaginationIcon} size={18} className="rotate-180" />
          </Link>
        </li>
        {pages.map((n) => {
          const active = n === page
          return (
            <li key={n}>
              <Link
                to="/"
                search={(prev) => patchSearch(prev, { page: n })}
                resetScroll={false}
                aria-label={`Página ${n}`}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  box,
                  active ? 'bg-primary font-bold text-primary-foreground' : 'border border-border text-foreground hover:border-primary',
                )}
              >
                {n}
              </Link>
            </li>
          )
        })}
        <li>
          <Link
            to="/"
            search={(prev) => patchSearch(prev, { page: Math.min(totalPages, page + 1) })}
            resetScroll={false}
            aria-label="Próxima página"
            aria-disabled={nextDisabled || undefined}
            tabIndex={nextDisabled ? -1 : undefined}
            className={cn(box, 'border border-border text-foreground', nextDisabled && 'pointer-events-none opacity-40')}
          >
            <Icon icon={ArrowRightPaginationIcon} size={18} />
          </Link>
        </li>
      </ul>
    </nav>
  )
}
