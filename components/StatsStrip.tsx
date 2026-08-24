'use client'

import { useState } from 'react'
import type { StatDeclaration } from '@/lib/types'
import { useStatLog } from '@/lib/firestore-hooks'
import { currentWeekRange, todayLocal } from '@/lib/dates'

function sparkPoints(values: number[]): string {
  if (values.length === 0) return ''
  const w = 160
  const h = 20
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const step = values.length > 1 ? w / (values.length - 1) : 0
  return values
    .map((v, i) => {
      const x = i * step
      const y = h - ((v - min) / range) * (h - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function BodyStripItem({ stat }: { stat: StatDeclaration }) {
  const { entries } = useStatLog(stat.log)
  const ascending = [...entries].reverse() // entries come back desc by date
  const latest = ascending[ascending.length - 1]
  const prev = ascending[ascending.length - 2]
  const delta = latest && prev ? latest.value - prev.value : null
  const color = stat.color ? `var(${stat.color})` : 'var(--text-dim)'

  return (
    <div className="stat-strip-item">
      <div className="ss-label">
        <span className="h-dot" style={{ background: color }} />
        {stat.label}
      </div>
      <div className="ss-values">
        {latest ? (
          <div className="ss-col">
            <span className="ss-val">
              {latest.value}
              {stat.unit && <span className="unit">{stat.unit}</span>}
            </span>
            {delta != null && (
              <span className={`h-delta${delta < 0 ? ' down' : ''}`}>
                {delta > 0 ? '+' : ''}
                {delta.toFixed(1)}
              </span>
            )}
          </div>
        ) : (
          <span className="ss-val dash">no data yet</span>
        )}
      </div>
      {ascending.length > 1 && (
        <svg className="spark" viewBox="0 0 160 20" preserveAspectRatio="none">
          <polyline points={sparkPoints(ascending.map((e) => e.value))} fill="none" stroke={color} strokeWidth="2" />
        </svg>
      )}
    </div>
  )
}

function SemesterStripItem({ stat }: { stat: StatDeclaration }) {
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

export function StatsStrip({ stats }: { stats: StatDeclaration[] }) {
  const [collapsed, setCollapsed] = useState(false)
  const body = stats.filter((s) => s.placement === 'body')
  const semester = stats.filter((s) => s.placement === 'semester')
  if (body.length === 0 && semester.length === 0) return null

  return (
    <div className="sticky-strip">
      <button className="strip-collapse-btn" onClick={() => setCollapsed((c) => !c)}>
        {collapsed ? '▾ stats' : '▴ hide'}
      </button>
      {!collapsed && (
        <>
          {body.length > 0 && (
            <div className="stat-strip-inner">
              {body.map((s) => (
                <BodyStripItem stat={s} key={s.id} />
              ))}
            </div>
          )}
          {semester.length > 0 && (
            <div className="stat-strip-inner" style={{ marginTop: body.length ? 8 : 0 }}>
              {semester.map((s) => (
                <SemesterStripItem stat={s} key={s.id} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
