import { cn } from 'cn'
import { useState } from 'react'
import { EyeOffIcon, EyeOffOutlineIcon } from '@/assets/icons'
import { Icon } from '@/components/layout'
import { Input } from '@/components/ui/input'

export function PasswordInput({ className, ...props }: Omit<React.ComponentProps<typeof Input>, 'type'>) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} className={cn('pr-11', className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={visible}
        className="absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded-xs text-foreground outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon icon={visible ? EyeOffOutlineIcon : EyeOffIcon} size={18} />
      </button>
    </div>
  )
}
