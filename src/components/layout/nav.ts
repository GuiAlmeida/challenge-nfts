export type ActiveNav = 'home' | 'market'

export function activeNavFor(pathname: string): ActiveNav {
  return /^\/(nft|cart|checkout|orders)(\/|$)/.test(pathname) ? 'market' : 'home'
}

export function headerHasDivider(pathname: string): boolean {
  return activeNavFor(pathname) === 'home'
}

export function hidesTabBar(pathname: string): boolean {
  return /^\/(login|register|checkout|orders\/|nft\/)/.test(pathname)
}

export function hidesFooterOnMobile(pathname: string): boolean {
  return /^\/(login|register)(\/|$)/.test(pathname)
}
