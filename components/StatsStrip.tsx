'use client'

import { useState } from 'react'
import type { EtfDeclaration, StatDeclaration } from '@/lib/types'
import { useStatLog } from '@/lib/firestore-hooks'
import { useStocks } from '@/lib/useStock'
import { currentWeekRange, todayLocal } from '@/lib/dates'
import { sparkPoints } from '@/lib/sparkline'
import { formatPrice } from '@/lib/formatCurrency'

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

type PeriodId = '1D' | '1W' | '1M' | '1Y' | '5Y' | '10Y'

// Yahoo's chart endpoint wants a (range, interval) pair, not a single
// "period" — these map the buttons to that pair. Widening the interval as
// the range grows keeps the point count (and payload size) sane.
const PERIODS: { id: PeriodId; range: string; interval: string; desc: string }[] = [
  { id: '1D', range: '1d', interval: '5m', desc: 'today · 5-min bars' },
  { id: '1W', range: '5d', interval: '30m', desc: '5 trading days · 30-min bars' },
  { id: '1M', range: '1mo', interval: '1d', desc: '1 month · daily close' },
  { id: '1Y', range: '1y', interval: '1wk', desc: '1 year · weekly close' },
  { id: '5Y', range: '5y', interval: '1mo', desc: '5 years · monthly close' },
  { id: '10Y', range: '10y', interval: '3mo', desc: '10 years · quarterly close' },
]

function EtfStripItem({ etf, range, interval }: { etf: EtfDeclaration; range: string; interval: string }) {
  const results = useStocks([etf.symbol], range, interval)
  const r = results[etf.symbol]
  const color = etf.color ? `var(${etf.color})` : 'var(--text-dim)'
  const up = r?.changePct != null && r.changePct >= 0

  return (
    <div className="stat-strip-item">
      <div className="ss-label">
        <span className="h-dot" style={{ background: color }} />
        {etf.label}
      </div>
      <div className="ss-values">
        {r?.price != null ? (
          <div className="ss-col">
            <span className="ss-val">{formatPrice(r.price, r.currency)}</span>
            {r.changePct != null && (
              <span className="h-delta" style={{ color: up ? 'var(--green)' : 'var(--red)' }}>
                {up ? '+' : ''}
                {r.changePct.toFixed(2)}%
              </span>
            )}
          </div>
        ) : (
          <span className="ss-val dash">loading…</span>
        )}
      </div>
      {r?.series && r.series.length > 1 && (
        <svg className="spark" viewBox="0 0 160 20" preserveAspectRatio="none">
          <polyline points={sparkPoints(r.series)} fill="none" stroke={color} strokeWidth="2" />
        </svg>
      )}
    </div>
  )
}

export function StatsStrip({
  stats,
  etfs,
  showEtfs,
  collapsed,
  onToggleCollapsed,
}: {
  stats: StatDeclaration[]
  etfs: EtfDeclaration[]
  showEtfs: boolean
  collapsed: boolean
  onToggleCollapsed: () => void
}) {
  const [period, setPeriod] = useState<PeriodId>('1M')

  if (showEtfs) {
    if (etfs.length === 0) return null
    const p = PERIODS.find((x) => x.id === period)!

    return (
      <div className="sticky-strip">
        <button className="strip-collapse-btn" onClick={onToggleCollapsed}>
          {collapsed ? '▾ ETFs' : '▴ hide'}
        </button>
        {!collapsed && (
          <>
            <div className="etf-period-row">
              <div className="etf-period-btns">
                {PERIODS.map((pd) => (
                  <button
                    key={pd.id}
                    className={`etf-period-btn${pd.id === period ? ' active' : ''}`}
                    onClick={() => setPeriod(pd.id)}
                  >
                    {pd.id}
                  </button>
                ))}
              </div>
              <span className="etf-period-desc">{p.desc}</span>
            </div>
            <div className="stat-strip-inner">
              {etfs.map((etf) => (
                <EtfStripItem etf={etf} range={p.range} interval={p.interval} key={etf.symbol} />
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  const body = stats.filter((s) => s.placement === 'body')
  const semester = stats.filter((s) => s.placement === 'semester')
  if (body.length === 0 && semester.length === 0) return null

  return (
    <div className="sticky-strip">
      <button className="strip-collapse-btn" onClick={onToggleCollapsed}>
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
