import { useEffect, useState, useSyncExternalStore } from 'react'
import { useMediaQuery } from '@/components/layout'

function subscribeVisibility(notify: () => void) {
  document.addEventListener('visibilitychange', notify)
  return () => document.removeEventListener('visibilitychange', notify)
}

const isDocumentVisible = () => document.visibilityState === 'visible'

export interface Carousel {
  active: number
  playing: boolean
  select: (index: number) => void
  holdProps: {
    onPointerEnter: () => void
    onPointerLeave: () => void
    onFocus: () => void
    onBlur: (event: React.FocusEvent<HTMLElement>) => void
  }
}

export function useCarousel(count: number, intervalMs: number): Carousel {
  const [active, setActive] = useState(0)
  const [choice, setChoice] = useState<'auto' | 'paused'>('auto')
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const visible = useSyncExternalStore(subscribeVisibility, isDocumentVisible, () => true)
  const stopped = choice === 'paused' || reducedMotion
  const playing = !stopped && !hovered && !focused && visible && count > 1

  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(() => setActive((current) => (current + 1) % count), intervalMs)
    return () => window.clearTimeout(timer)
  }, [playing, active, count, intervalMs])

  return {
    active,
    playing,
    select: (index) => {
      setChoice('paused')
      setActive(index)
    },
    holdProps: {
      onPointerEnter: () => setHovered(true),
      onPointerLeave: () => setHovered(false),
      onFocus: () => setFocused(true),
      onBlur: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      },
    },
  }
}
