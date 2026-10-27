import { MinusIcon, PlusIcon } from 'lucide-react'
import { cn } from 'cn'
import { useId } from 'react'

type StepperSize = 'sm' | 'lg'

export function Stepper({
  value,
  min = 1,
  max,
  onChange,
  size = 'sm',
  label,
  disabled,
  className,
}: {
  value: number
  min?: number
  max: number
  onChange: (next: number) => void
  size?: StepperSize
  label: string
  disabled?: boolean
  className?: string
}) {
  const buttonClass = cn(
    'inline-flex cursor-pointer items-center justify-center rounded-pill border border-ink bg-primary text-primary-foreground shadow-[0_4px_6px_rgba(20,13,10,0.15)] transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40',
    size === 'sm' ? 'h-7.5 w-5 [&_svg]:size-4' : 'h-12.25 w-8.25 [&_svg]:size-6',
  )
  const outputId = useId()
  return (
    <div className={cn('inline-flex items-center gap-3', className)} role="group" aria-label={`Quantidade de ${label}`}>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label={`Diminuir quantidade de ${label}`}
        aria-controls={outputId}
      >
        <MinusIcon aria-hidden="true" />
      </button>
      <output
        id={outputId}
        aria-live="polite"
        className={cn('min-w-[1ch] text-center font-mono text-foreground', size === 'sm' ? 'text-[17px] leading-6' : 'text-xl leading-7')}
      >
        {value}
      </output>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label={`Aumentar quantidade de ${label}`}
        aria-controls={outputId}
      >
        <PlusIcon aria-hidden="true" />
      </button>
    </div>
  )
}
