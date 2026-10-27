import { cn } from 'cn'

export function PageContainer({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mx-auto w-full max-w-300 px-6', className)} {...props} />
}
