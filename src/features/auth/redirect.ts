export function safeRedirect(target: string | undefined, fallback = '/'): string {
  if (!target || !target.startsWith('/') || target.startsWith('//')) return fallback
  if (/^\/(login|register)(\?|$)/.test(target)) return fallback
  return target
}

export const isPrivatePath = (pathname: string): boolean => /^\/(checkout|orders|account)(\/|$)/.test(pathname)
