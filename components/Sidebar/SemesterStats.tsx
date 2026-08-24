'use client'

import { useState } from 'react'
import type { StatDeclaration } from '@/lib/types'
import { useStatLog } from '@/lib/firestore-hooks'

function SemesterStatBlock({ stat }: { stat: StatDeclaration }) {
  const { entries } = useStatLog(stat.log)
  const [expanded, setExpanded] = useState(false)

  if (stat.type === 'latest') {
    const latest = entries[0] // desc order, [0] = most recent
    return (
      <div className="stat-block">
        <div className="stat-top">
          <span className="stat-label">{stat.label}</span>
          <span className="stat-value">
            {latest ? latest.value : '—'}
            {stat.unit && <span className="unit">{stat.unit}</span>}
          </span>
        </div>
      </div>
    )
  }

  if (stat.type === 'total') {
    const cutoff = stat.reset_date
    const inRange = cutoff ? entries.filter((e) => e.date >= cutoff) : entries
    const total = inRange.reduce((sum, e) => sum + e.value, 0)
    const recent = inRange.slice(0, 6)
    return (
      <div className={`stat-block${recent.length ? ' stat-hoverable' : ''}`} onClick={() => recent.length && setExpanded((e) => !e)}>
        <div className="stat-top">
          <span className="stat-label">{stat.label}</span>
          <span className="stat-value">
            {total.toFixed(1)}
            {stat.unit && <span className="unit">{stat.unit}</span>}
          </span>
        </div>
        {recent.length > 0 && (
          <div className={`stat-popover${expanded ? ' show' : ''}`}>
            <div className="ptitle">Last {recent.length} entries</div>
            {recent.map((e) => (
              <div className="prow" key={e.id}>
                <span>{e.date}</span>
                <span>{e.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // fraction
  const count = entries.length
  const goal = stat.goal ?? 1
  const pct = Math.min(100, (count / goal) * 100)
  return (
    <div className="stat-block">
      <div className="stat-top">
        <span className="stat-label">{stat.label}</span>
        <span className="stat-value">
          {count}
          <span className="unit">/ {goal}</span>
        </span>
      </div>
      <div className="therm">
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function SemesterStats({ stats }: { stats: StatDeclaration[] }) {
  const semStats = stats.filter((s) => s.sidebar === 'semester')
  if (semStats.length === 0) return null
  return (
    <div className="sb-section hide-on-collapse">
      <h2>Semester Stats</h2>
      {semStats.map((s) => (
        <SemesterStatBlock stat={s} key={s.id} />
      ))}
    </div>
  )
}
