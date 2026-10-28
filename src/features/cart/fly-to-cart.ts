const ANCHOR_SELECTOR = '[data-cart-anchor]'

function visibleAnchor(): HTMLElement | null {
  const anchors = document.querySelectorAll<HTMLElement>(ANCHOR_SELECTOR)
  for (const anchor of anchors) if (anchor.getClientRects().length > 0) return anchor
  return null
}

export function flyToCart(source: HTMLElement): void {
  const anchor = visibleAnchor()
  if (!anchor) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    anchor.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 300 })
    return
  }
  const from = source.getBoundingClientRect()
  const to = anchor.getBoundingClientRect()
  const ghost = source.cloneNode(true) as HTMLElement
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    margin: '0',
    borderRadius: '16px',
    pointerEvents: 'none',
    zIndex: '60',
  })
  ghost.setAttribute('aria-hidden', 'true')
  document.body.append(ghost)
  const dx = to.left + to.width / 2 - (from.left + from.width / 2)
  const dy = to.top + to.height / 2 - (from.top + from.height / 2)
  const flight = ghost.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - 80}px) scale(0.45)`, opacity: 0.9, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.06)`, opacity: 0.4 },
    ],
    { duration: 700, easing: 'cubic-bezier(0.45, 0, 0.2, 1)' },
  )
  flight.onfinish = () => {
    ghost.remove()
    anchor.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' })
  }
  flight.oncancel = () => ghost.remove()
}
