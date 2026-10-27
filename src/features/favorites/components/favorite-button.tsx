import { cn } from 'cn'
import { HeartIcon, HeartOutlineIcon } from '@/assets/icons'
import { Icon } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { useFavorites } from '../queries/use-favorites'
import { useToggleFavorite } from '../use-toggle-favorite'

type Variant = 'circle' | 'outline'

export function FavoriteButton({
  nftId,
  name,
  variant = 'circle',
  size = 28,
  className,
}: {
  nftId: string
  name: string
  variant?: Variant
  size?: number
  className?: string
}) {
  const { isFavorite } = useFavorites()
  const toggle = useToggleFavorite()
  const active = isFavorite(nftId)
  const label = active ? `Remover ${name} dos favoritos` : `Favoritar ${name}`
  const icon = <Icon icon={active ? HeartIcon : HeartOutlineIcon} size={variant === 'circle' ? Math.round(size * 0.5) : 20} />

  if (variant === 'outline') {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        radius="md"
        aria-label={label}
        aria-pressed={active}
        onClick={() => toggle(nftId, name, active)}
        className={cn('w-32.5 gap-2 text-sm', className)}
      >
        {icon}
        {active ? 'Favoritado' : 'Favoritar'}
      </Button>
    )
  }
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={() => toggle(nftId, name, active)}
      style={{ width: size, height: size }}
      className={cn(
        'flex items-center justify-center rounded-full border border-border bg-surface-raised text-brand transition-colors outline-none hover:border-primary focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      {icon}
    </button>
  )
}
