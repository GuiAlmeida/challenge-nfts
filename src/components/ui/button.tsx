import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import { Slot } from 'radix-ui'

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-mono transition-[background-color,border-color,color,opacity] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        primary: 'bg-primary font-bold text-primary-foreground hover:bg-brand',
        outline: 'border border-primary bg-transparent font-medium text-brand hover:bg-surface-raised',
        ghost: 'bg-transparent font-normal text-brand hover:text-foreground',
        link: 'h-auto bg-transparent px-0 font-normal text-brand underline-offset-4 hover:underline',
        subtle: 'border border-border bg-surface-raised font-medium text-foreground hover:border-border-soft',
        pill: 'bg-linear-[100deg] from-primary from-[4%] to-primary/80 to-[122%] font-bold text-primary-foreground hover:to-primary',
        destructive: 'bg-destructive font-bold text-destructive-foreground hover:bg-coral/90',
      },
      size: {
        xs: 'h-8.75 px-4 text-base',
        sm: 'h-10 px-6 text-[15px]',
        md: 'h-11.25 px-6 text-base',
        lg: 'h-15 px-12 text-base',
        icon: 'size-10',
        'icon-lg': 'size-15',
      },
      radius: {
        xs: 'rounded-xs',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        pill: 'rounded-pill',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'sm',
      radius: 'md',
    },
  },
)

function Button({
  className,
  variant = 'primary',
  size = 'sm',
  radius = 'md',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, radius, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
