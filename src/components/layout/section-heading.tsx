import { cn } from 'cn'

export function SectionHeading({
  as: Tag = 'h2',
  className,
  children,
  action,
  ...props
}: React.ComponentProps<'div'> & { as?: 'h1' | 'h2' | 'h3'; action?: React.ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-3 border-b border-border pb-3', className)} {...props}>
      <div className="flex items-center justify-between gap-4">
        <Tag className="font-mono text-base leading-4 font-bold text-brand">{children}</Tag>
        {action}
      </div>
    </div>
  )
}
