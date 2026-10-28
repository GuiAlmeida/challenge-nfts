export type ActiveNav = 'home' | 'market'

export function activeNavFor(pathname: string, hash = ''): ActiveNav {
  if (pathname === '/' && hash === 'catalogo') return 'market'
  return /^\/(nft|cart|checkout|orders)(\/|$)/.test(pathname) ? 'market' : 'home'
}

export function hidesTabBar(pathname: string): boolean {
  return /^\/(login|register|checkout|orders\/|nft\/|cart)/.test(pathname)
}

export function hidesFooterOnMobile(pathname: string): boolean {
  return /^\/(login|register)(\/|$)/.test(pathname)
}

export function mobileToastOffset(pathname: string): number {
  if (/^\/nft\//.test(pathname)) return 176
  return hidesTabBar(pathname) ? 16 : 104
}
