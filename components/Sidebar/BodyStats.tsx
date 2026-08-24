'use client'

import type { StatDeclaration } from '@/lib/types'
import { useStatLog } from '@/lib/firestore-hooks'

function sparkPoints(values: number[]): string {
  if (values.length === 0) return ''
  const w = 240
  const h = 22
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

function BodyStatRow({ stat }: { stat: StatDeclaration }) {
  const { entries } = useStatLog(stat.log)
  const ascending = [...entries].reverse() // entries come back desc by date
  const latest = ascending[ascending.length - 1]
  const prev = ascending[ascending.length - 2]
  const delta = latest && prev ? latest.value - prev.value : null
  const color = stat.color ? `var(${stat.color})` : 'var(--text-dim)'

  return (
    <div className="habit-row">
      <div className="hr-top">
        <div className="h-name">
          <span className="h-dot" style={{ background: color }} />
          <span className="hide-on-collapse">{stat.label}</span>
        </div>
        <div className="hide-on-collapse">
          {latest ? (
            <>
              <span className="h-current">{latest.value}</span>
              {delta != null && (
                <span className={`h-delta${delta < 0 ? ' down' : ''}`}>
                  {delta > 0 ? '+' : ''}
                  {delta.toFixed(1)} {stat.unit}
                </span>
              )}
            </>
          ) : (
            <span className="h-delta">no data yet</span>
          )}
        </div>
      </div>
      {ascending.length > 1 && (
        <svg className="spark hide-on-collapse" viewBox="0 0 240 22" preserveAspectRatio="none">
          <polyline
            points={sparkPoints(ascending.map((e) => e.value))}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
        </svg>
      )}
    </div>
  )
}

export function BodyStats({ stats }: { stats: StatDeclaration[] }) {
  const bodyStats = stats.filter((s) => s.sidebar === 'body')
  if (bodyStats.length === 0) return null
  return (
    <div className="sb-section">
      <h2 className="hide-on-collapse">Body</h2>
      {bodyStats.map((s) => (
        <BodyStatRow stat={s} key={s.id} />
      ))}
    </div>
  )
}
