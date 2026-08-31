'use client'

import { useEffect, useRef, useState } from 'react'

const LINKS = [
  { label: 'PAI Lab', href: 'https://pailab.io' },
  { label: 'Courses', href: 'https://courses.aaron.kr' },
  { label: 'CV / Contact', href: 'https://aaronsnowberger.com' },
  { label: 'Blog', href: 'https://notes.aaron.kr' },
  { label: 'Scientia', href: 'https://sci.aaron.kr/' },
  { label: 'KSPAI', href: 'https://kspai.org' },
]

export function SiteNav() {
  const navRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById('hero-sentinel')
    if (!sentinel) return
    // Negative top rootMargin the height of the sticky bar itself — without
    // it, "scrolled" would only flip once the sentinel passes the very top
    // of the viewport, by which point the sticky nav (sitting at top:0) has
    // already been overlapping regular content for its own height's worth
    // of scroll, transparent, before switching.
    const navHeight = navRef.current?.offsetHeight ?? 0
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), {
      rootMargin: `-${navHeight}px 0px 0px 0px`,
      threshold: 0,
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = navRef.current
    if (!el) return
    // `--sitenav-height` is what `.hero-band`'s padding-top reserves for
    // this now-`fixed` bar (see the CSS) — measured live, not hardcoded,
    // since the nav grows taller when its links wrap to a second line on
    // narrow screens.
    const setHeightVar = () => {
      document.documentElement.style.setProperty('--sitenav-height', `${el.offsetHeight}px`)
    }
    setHeightVar()
    const resizeObserver = new ResizeObserver(setHeightVar)
    resizeObserver.observe(el)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div className={`sitenav${scrolled ? ' scrolled' : ''}`} ref={navRef}>
      <span className="snlabel">Sites</span>
      {LINKS.map((l) => (
        <a href={l.href} key={l.label} target="_blank" rel="noopener noreferrer">
          {l.label}
        </a>
      ))}
    </div>
  )
}
