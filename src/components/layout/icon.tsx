import type { ComponentType, SVGProps } from 'react'
import { cn } from 'cn'

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

export function Icon({ icon: Svg, size = 20, label, className }: { icon: IconComponent; size?: number; label?: string; className?: string }) {
  return (
    <Svg
      width={size}
      height={size}
      aria-hidden={label ? 'false' : 'true'}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
      className={cn('shrink-0', className)}
    />
  )
}
