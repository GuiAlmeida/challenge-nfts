import { useRouter } from '@tanstack/react-router'
import { ArrowLeftIcon } from '@/assets/icons'
import { Icon } from './icon'

export function MobileTopBar({ title, action }: { title: string; action?: React.ReactNode }) {
  const router = useRouter()
  return (
    <div className="flex items-center gap-3 px-6 pt-8 pb-4 md:hidden">
      <button
        type="button"
        onClick={() => router.history.back()}
        aria-label="Voltar"
        className="flex size-9 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon icon={ArrowLeftIcon} size={36} />
      </button>
      <h1 className="flex-1 text-center font-mono text-xl leading-6 font-bold text-foreground">{title}</h1>
      <div className="flex size-9 items-center justify-center">{action}</div>
    </div>
  )
}
