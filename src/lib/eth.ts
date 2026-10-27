export const WEI_PER_ETH = 10n ** 18n
const ETH_STRING = /^(\d+)(?:\.(\d{1,18}))?$/

export type EthString = string

export function isEthString(value: unknown): value is EthString {
  return typeof value === 'string' && ETH_STRING.test(value)
}

export function parseEth(value: EthString): bigint {
  const match = ETH_STRING.exec(value)
  if (!match) throw new RangeError(`Valor ETH inválido: ${value}`)
  const whole = match[1] ?? '0'
  const fraction = (match[2] ?? '').padEnd(18, '0')
  return BigInt(whole) * WEI_PER_ETH + BigInt(fraction)
}

export function formatEth(wei: bigint, options: { minDecimals?: number; maxDecimals?: number } = {}): EthString {
  const { minDecimals = 2, maxDecimals = 18 } = options
  const negative = wei < 0n
  const abs = negative ? -wei : wei
  const whole = abs / WEI_PER_ETH
  let fraction = (abs % WEI_PER_ETH).toString().padStart(18, '0').slice(0, maxDecimals)
  fraction = fraction.replace(/0+$/, '')
  if (fraction.length < minDecimals) fraction = fraction.padEnd(minDecimals, '0')
  const text = fraction.length > 0 ? `${whole}.${fraction}` : `${whole}`
  return negative ? `-${text}` : text
}

export function mulQty(unitWei: bigint, quantity: number): bigint {
  if (!Number.isInteger(quantity) || quantity < 0) throw new RangeError(`Quantidade inválida: ${quantity}`)
  return unitWei * BigInt(quantity)
}

export function applyBps(wei: bigint, bps: number): bigint {
  if (!Number.isInteger(bps) || bps < 0 || bps > 10_000) throw new RangeError(`Bps inválido: ${bps}`)
  return (wei * BigInt(bps)) / 10_000n
}

export function sumWei(values: readonly bigint[]): bigint {
  return values.reduce((acc, value) => acc + value, 0n)
}

export function sumEth(values: readonly EthString[]): EthString {
  return formatEth(sumWei(values.map(parseEth)))
}

export function compareEth(a: EthString, b: EthString): -1 | 0 | 1 {
  const x = parseEth(a)
  const y = parseEth(b)
  return x < y ? -1 : x > y ? 1 : 0
}
