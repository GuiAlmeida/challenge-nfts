import { cn } from 'cn'
import { FacebookIcon, GoogleIcon } from '@/assets/icons'
import { Icon, notifyOutOfScope } from '@/components/layout'

const PROVIDERS = [
  { label: 'Continuar com Google', icon: GoogleIcon, name: 'Login com Google' },
  { label: 'Continuar com Facebook', icon: FacebookIcon, name: 'Login com Facebook' },
]

export function SocialButtons({ className, gap = 'gap-3' }: { className?: string; gap?: string }) {
  return (
    <div className={cn('flex flex-col', gap, className)}>
      <div className="flex items-center gap-3 text-[13px] leading-4 text-foreground">
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        Ou continue com
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>
      <div className={cn('flex flex-col', gap)}>
        {PROVIDERS.map((provider) => (
          <button
            key={provider.label}
            type="button"
            aria-disabled="true"
            title="Indisponível nesta demonstração"
            onClick={() => notifyOutOfScope(provider.name)}
            className="flex h-10 w-full items-center justify-center gap-3 rounded-[5px] border border-border text-[13px] leading-4 font-medium text-sand outline-none hover:border-border-soft focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon icon={provider.icon} size={20} />
            {provider.label}
          </button>
        ))}
      </div>
    </div>
  )
}
