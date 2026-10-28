import type { Order, OrderStatus } from '@/contracts/order'

export const isTerminal = (status: OrderStatus): boolean => status !== 'pending'

export const shortHash = (hash: string): string => (hash.length > 12 ? `${hash.slice(0, 6)}…${hash.slice(-4).toUpperCase()}` : hash)

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export const formatOrderDate = (iso: string): string => {
  const date = new Date(iso)
  return `${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]}, ${date.getFullYear()}`
}

export const newerOrder = (current: Order | undefined, incoming: Order): Order =>
  current && current.version >= incoming.version ? current : incoming
