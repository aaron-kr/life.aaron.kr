'use client'

import type { StatDeclaration } from '@/lib/types'
import { useStatLog } from '@/lib/firestore-hooks'
import { currentWeekRange, todayLocal } from '@/lib/dates'

function StripItem({ stat }: { stat: StatDeclaration }) {
  const { entries } = useStatLog(stat.log)
  const [weekStart, weekEnd] = currentWeekRange(todayLocal())
  const thisWeek = entries.filter((e) => e.date >= weekStart && e.date <= weekEnd)

  let weekDisplay: string
  let cumDisplay: string

  if (stat.type === 'latest') {
    weekDisplay = thisWeek.length ? String(thisWeek[0].value) : '—'
    cumDisplay = entries.length ? String(entries[0].value) : '—'
  } else if (stat.type === 'total') {
    const cutoff = stat.reset_date
    const inRange = cutoff ? entries.filter((e) => e.date >= cutoff) : entries
    const total = inRange.reduce((sum, e) => sum + e.value, 0)
    const weekTotal = thisWeek.reduce((sum, e) => sum + e.value, 0)
    weekDisplay = thisWeek.length ? weekTotal.toFixed(1) : '—'
    cumDisplay = total.toFixed(1)
  } else {
    // fraction
    const goal = stat.goal ?? 1
    weekDisplay = thisWeek.length ? `+${thisWeek.length}` : '—'
    cumDisplay = `${entries.length}/${goal}`
  }

  return (
    <div className="stat-strip-item">
      <div className="ss-label">{stat.label}</div>
      <div className="ss-values">
        <div className="ss-col">
          <span className="ss-tag">This wk</span>
          <span className={`ss-val${weekDisplay === '—' ? ' dash' : ''}`}>{weekDisplay}</span>
        </div>
        <div className="ss-col">
          <span className="ss-tag">Total</span>
          <span className="ss-val">{cumDisplay}</span>
        </div>
      </div>
    </div>
  )
}

export function SemesterStatsStrip({ stats }: { stats: StatDeclaration[] }) {
  const semStats = stats.filter((s) => s.sidebar === 'semester')
  if (semStats.length === 0) return null

  return (
    <div className="sticky-strip">
      <div className="stat-strip-inner">
        {semStats.map((s) => (
          <StripItem stat={s} key={s.id} />
        ))}
      </div>
    </div>
  )
}
