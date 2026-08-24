import type { Quote } from '@/lib/types'

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  return Math.floor(diff / 86400000)
}

export function QuoteBanner({ quotes }: { quotes: Quote[] }) {
  if (quotes.length === 0) return null
  const quote = quotes[dayOfYear(new Date()) % quotes.length]
  return (
    <div className="quote-banner">
      <div>
        <span className="qtext">&quot;{quote.text}&quot;</span>
        <span className="qref">{quote.ref}</span>
      </div>
    </div>
  )
}
