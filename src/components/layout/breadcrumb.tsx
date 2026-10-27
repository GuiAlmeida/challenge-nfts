import { Link } from '@tanstack/react-router'
import { cn } from 'cn'

export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Navegação estrutural" className={cn('font-mono text-[15px] leading-4 font-bold text-foreground', className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.to && !last ? (
                <Link to={item.to} className="hover:text-brand focus-visible:text-brand">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined}>{item.label}</span>
              )}
              {!last ? <span aria-hidden="true">/</span> : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
