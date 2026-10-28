import { BackButton } from './back-button'

export function MobileTopBar({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-6 pt-8 pb-4 md:hidden">
      <BackButton />
      <h1 className="flex-1 text-center font-mono text-lg leading-6 font-bold text-foreground">{title}</h1>
      <div className="flex size-8.75 items-center justify-center">{action}</div>
    </div>
  )
}
