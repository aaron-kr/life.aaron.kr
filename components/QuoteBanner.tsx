'use client'

import { useEffect, useState } from 'react'
import type { BiblePlanEntry, Quote } from '@/lib/types'

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  return Math.floor(diff / 86400000)
}

function todayMonthDay(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** The quote rotates automatically once a day (deterministic by day-of-year,
 * so it's stable within a day and the same for every visit that day) — the
 * arrows just let you browse other quotes in the list without changing that
 * day-to-day rotation for next time. */
export function QuoteBanner({ quotes, biblePlan }: { quotes: Quote[]; biblePlan: BiblePlanEntry[] }) {
  const [mounted, setMounted] = useState(false)
  const [baseIndex, setBaseIndex] = useState(0)
  const [offset, setOffset] = useState(0)
  const [reading, setReading] = useState<string | null>(null)
  const [arrowsRevealed, setArrowsRevealed] = useState(false)

  useEffect(() => {
    const now = new Date()
    setBaseIndex(quotes.length ? dayOfYear(now) % quotes.length : 0)
    const mmdd = todayMonthDay(now)
    const entry =
      biblePlan.find((e) => e.date === mmdd) ?? (mmdd === '02-29' ? biblePlan.find((e) => e.date === '02-28') : undefined)
    setReading(entry?.reading ?? null)
    setMounted(true)
    // Only needs to run once on mount — quotes/biblePlan are static per page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!mounted || quotes.length === 0) return null

  const index = ((baseIndex + offset) % quotes.length + quotes.length) % quotes.length
  const quote = quotes[index]

  return (
    <div className="quote-banner">
      <div className="qmain">
        <span className="qtext">&quot;{quote.text}&quot;</span>
        <span className="qref">{quote.ref}</span>
      </div>
      {reading && (
        <div className="bible-plan">
          <span className="qref">Today&apos;s reading</span>
          <span className="qtext bible-text">{reading}</span>
        </div>
      )}
      <div
        className={`quote-arrows-zone${arrowsRevealed ? ' revealed' : ''}`}
        onClick={() => setArrowsRevealed(true)}
      >
        <button
          className="q-arrow"
          onClick={(e) => {
            e.stopPropagation()
            setOffset((o) => o - 1)
          }}
          aria-label="Previous quote"
        >
          ‹
        </button>
        <button
          className="q-arrow"
          onClick={(e) => {
            e.stopPropagation()
            setOffset((o) => o + 1)
          }}
          aria-label="Next quote"
        >
          ›
        </button>
      </div>
    </div>
  )
}
