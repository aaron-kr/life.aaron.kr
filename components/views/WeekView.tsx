import { Fragment } from 'react'
import Image from 'next/image'
import type { DashboardTemplate, University, Weekday } from '@/lib/types'
import { fmtHourLabel, minutesSinceMidnight, todayLocal, weekdayKey } from '@/lib/dates'
import { getThisFullWeekDays } from '@/lib/weekDays'

const ROW_H = 46

const LEGEND = [
  { color: 'var(--blue)', label: 'Class' },
  { color: 'var(--violet)', label: 'Deep work' },
  { color: 'var(--green)', label: 'Family' },
  { color: 'var(--gold)', label: 'Church' },
  { color: 'var(--pink)', label: 'Gym' },
  { color: 'var(--teal)', label: 'Commute' },
  { color: 'var(--text-faint)', label: 'No-phone' },
]

export function WeekView({
  template,
  weekdayUniversities,
  universities,
}: {
  template: DashboardTemplate
  weekdayUniversities: Partial<Record<Weekday, University[]>>
  universities: University[]
}) {
  const blocks = template.recurring_blocks
  const todayKey = weekdayKey(todayLocal())
  const days = getThisFullWeekDays(template)

  const startHours = blocks.length ? blocks.map((b) => minutesSinceMidnight(b.start) / 60) : [7]
  const endHours = blocks.length ? blocks.map((b) => minutesSinceMidnight(b.end) / 60) : [20]
  const hourStart = Math.max(0, Math.floor(Math.min(...startHours)))
  const hourEnd = Math.min(24, Math.ceil(Math.max(...endHours)))
  const hours = Array.from({ length: hourEnd - hourStart }, (_, i) => hourStart + i)

  function logoFor(abbr: string | undefined) {
    return abbr ? universities.find((u) => u.abbr === abbr) : undefined
  }

  return (
    <section className="panel active">
      <div className="card">
        <h3>
          This week <span className="pill">semester template + daily edits</span>
        </h3>
        <div className="week-grid">
          <div className="gcell ghead" />
          {days.map((d) => {
            const schools = weekdayUniversities[d.weekday as Weekday] ?? []
            return (
              <div key={d.weekday} className={`gcell ghead${d.weekday === todayKey ? ' today' : ''}`}>
                {d.label}
                <span className="city-tag">
                  {d.cityDisplay || '—'}
                  {schools.map((uni) => (
                    <Image key={uni.abbr} src={uni.logo} alt={uni.name} title={uni.name} width={13} height={13} unoptimized />
                  ))}
                </span>
              </div>
            )
          })}

          {hours.map((h) => (
            <Fragment key={h}>
              <div className="time-label">{fmtHourLabel(`${h}:00`)}</div>
              {days.map((d) => {
                const cellBlocks = blocks.filter(
                  (b) => b.day === d.weekday && Math.floor(minutesSinceMidnight(b.start) / 60) === h
                )
                return (
                  <div className="gcell" key={`${d.weekday}-${h}`}>
                    {cellBlocks.map((b, i) => {
                      const durationMin = minutesSinceMidnight(b.end) - minutesSinceMidnight(b.start)
                      const spanHours = durationMin / 60
                      const uni = logoFor(b.university)
                      return (
                        <div
                          key={i}
                          className={`block b-${b.type}`}
                          style={{
                            height: `${ROW_H * spanHours - 4}px`,
                            ...(b.color
                              ? {
                                  background: `color-mix(in srgb, var(${b.color}) 22%, var(--panel-2))`,
                                  borderLeftColor: `var(${b.color})`,
                                }
                              : {}),
                          }}
                        >
                          <div className="bt">
                            {uni && <Image src={uni.logo} alt={uni.name} width={12} height={12} unoptimized />}
                            {b.title}
                          </div>
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
