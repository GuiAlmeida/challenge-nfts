import { useIsFetching } from '@tanstack/react-query'
import { useOnline } from './use-online'

export function FetchingBar() {
  const fetching = useIsFetching()
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-primary transition-opacity duration-300"
      style={{ opacity: fetching > 0 ? 1 : 0 }}
    />
  )
}

export function OfflineBanner() {
  const online = useOnline()
  if (online) return null
  return (
    <div role="status" aria-live="polite" className="bg-coral px-6 py-2 text-center font-mono text-sm font-medium text-ink">
      Sem conexão. Tentaremos novamente quando a rede voltar.
    </div>
  )
}
