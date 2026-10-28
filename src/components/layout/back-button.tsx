import { useCanGoBack, useRouter } from '@tanstack/react-router'
import { ArrowLeftIcon } from '@/assets/icons'
import { Icon } from './icon'

export function BackButton() {
  const router = useRouter()
  const canGoBack = useCanGoBack()
  return (
    <button
      type="button"
      onClick={() => (canGoBack ? router.history.back() : void router.navigate({ to: '/' }))}
      aria-label="Voltar"
      className="flex size-8.75 shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised text-sand outline-none hover:border-border-soft hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon icon={ArrowLeftIcon} size={20} />
    </button>
  )
}
