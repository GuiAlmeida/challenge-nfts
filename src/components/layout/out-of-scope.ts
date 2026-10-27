import { toast } from 'sonner'

export function notifyOutOfScope(feature: string): void {
  toast.info(`${feature} não faz parte desta demonstração.`, { id: `out-of-scope:${feature}` })
}
