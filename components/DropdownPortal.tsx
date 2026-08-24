'use client'

import { useEffect, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'

/**
 * Renders `children` into document.body, positioned under `anchorRef`.
 *
 * Why: an absolutely-positioned dropdown only reliably paints above its
 * *own* stacking context. header.top and .quote-banner both sit at
 * z-index:3 — a tie — so the later DOM sibling (.quote-banner) wins for any
 * pixels where a header dropdown overflows into its space, no matter how
 * high the dropdown's own z-index goes. A portal sidesteps the whole
 * ancestor stacking-context chain instead of chasing z-index numbers.
 */
export function DropdownPortal({
  anchorRef,
  open,
  align = 'right',
  children,
}: {
  anchorRef: RefObject<HTMLElement | null>
  open: boolean
  align?: 'left' | 'right'
  children: ReactNode
}) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open || !anchorRef.current) return
    setRect(anchorRef.current.getBoundingClientRect())
    function onReflow() {
      if (anchorRef.current) setRect(anchorRef.current.getBoundingClientRect())
    }
    window.addEventListener('resize', onReflow)
    window.addEventListener('scroll', onReflow, true)
    return () => {
      window.removeEventListener('resize', onReflow)
      window.removeEventListener('scroll', onReflow, true)
    }
  }, [open, anchorRef])

  if (!mounted || !open || !rect) return null

  const style: CSSProperties = {
    position: 'fixed',
    top: rect.bottom + 8,
    zIndex: 1000,
    ...(align === 'right' ? { right: window.innerWidth - rect.right } : { left: rect.left }),
  }

  return createPortal(
    <div style={style} className="dropdown-portal">
      {children}
    </div>,
    document.body
  )
}
