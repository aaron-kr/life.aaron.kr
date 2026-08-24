import { Fragment } from 'react'
import type { DashboardTemplate } from '@/lib/types'
import { WEEKDAY_ORDER, fmtHourLabel, minutesSinceMidnight, todayLocal, weekdayKey } from '@/lib/dates'

const ROW_H = 34

const LEGEND = [
  { color: 'var(--blue)', label: 'Class' },
  { color: 'var(--violet)', label: 'Deep work' },
  { color: 'var(--green)', label: 'Family' },
  { color: 'var(--gold)', label: 'Church' },
  { color: 'var(--pink)', label: 'Gym' },
  { color: 'var(--text-faint)', label: 'No-phone' },
]

export function WeekView({ template }: { template: DashboardTemplate }) {
  const blocks = template.recurring_blocks
  const todayKey = weekdayKey(todayLocal())

  const startHours = blocks.length ? blocks.map((b) => minutesSinceMidnight(b.start) / 60) : [7]
  const endHours = blocks.length ? blocks.map((b) => minutesSinceMidnight(b.end) / 60) : [20]
  const hourStart = Math.max(0, Math.floor(Math.min(...startHours)))
  const hourEnd = Math.min(24, Math.ceil(Math.max(...endHours)))
  const hours = Array.from({ length: hourEnd - hourStart }, (_, i) => hourStart + i)

  return (
    <section className="panel active">
      <div className="card">
        <h3>
          This week <span className="pill">semester template + daily edits</span>
        </h3>
        <div className="week-grid">
          <div className="gcell ghead" />
          {WEEKDAY_ORDER.map((wd) => {
            const mapping = template.weekdays[wd]
            return (
              <div key={wd} className={`gcell ghead${wd === todayKey ? ' today' : ''}`}>
                {wd.slice(0, 3).toUpperCase()}
                <span className="city-tag">{mapping?.city ?? '—'}</span>
              </div>
            )
          })}

          {hours.map((h) => (
            <Fragment key={h}>
              <div className="time-label">{fmtHourLabel(`${h}:00`)}</div>
              {WEEKDAY_ORDER.map((wd) => {
                const cellBlocks = blocks.filter((b) => b.day === wd && Math.floor(minutesSinceMidnight(b.start) / 60) === h)
                return (
                  <div className="gcell" key={`${wd}-${h}`}>
                    {cellBlocks.map((b, i) => {
                      const durationMin = minutesSinceMidnight(b.end) - minutesSinceMidnight(b.start)
                      const spanHours = durationMin / 60
                      return (
                        <div
                          key={i}
                          className={`block b-${b.type}`}
                          style={{ height: `${ROW_H * spanHours - 4}px` }}
                        >
                          <div className="bt">{b.title}</div>
                          {b.sub && <div className="bs">{b.sub}</div>}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
        <div className="legend">
          {LEGEND.map((l) => (
            <div className="lg-item" key={l.label}>
              <span className="lg-dot" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
