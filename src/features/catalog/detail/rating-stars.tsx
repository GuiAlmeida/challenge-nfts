import { cn } from 'cn'
import { StarIcon } from '@/assets/icons'
import { Icon } from '@/components/layout'

export function RatingStars({ rating, size = 15, className }: { rating: number; size?: number; className?: string }) {
  const filled = Math.round(rating)
  return (
    <span role="img" aria-label={`Avaliação ${rating.toLocaleString('pt-BR')} de 5`} className={cn('inline-flex items-center gap-1', className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} icon={StarIcon} size={size} className={i < filled ? 'text-brand' : 'text-border-soft'} />
      ))}
    </span>
  )
}
