const PRIVATE_ROOTS = new Set(['favorites', 'me', 'wallets', 'orders', 'quote'])

export function isPrivateKey(key: readonly unknown[]): boolean {
  const [root, scope] = key
  if (typeof root === 'string' && PRIVATE_ROOTS.has(root)) return true
  return root === 'cart' && typeof scope === 'string' && scope.startsWith('user:')
}
