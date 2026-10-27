const timers = new Set<ReturnType<typeof setTimeout>>()

export function scheduleMock(fn: () => void, delayMs: number): ReturnType<typeof setTimeout> {
  const handle = setTimeout(() => {
    timers.delete(handle)
    fn()
  }, delayMs)
  timers.add(handle)
  return handle
}

export function clearMockTimers(): void {
  for (const handle of timers) clearTimeout(handle)
  timers.clear()
}
