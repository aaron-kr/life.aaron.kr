import { Fragment } from 'react'
import Image from 'next/image'
import type { DashboardTemplate, FullWeekday, University } from '@/lib/types'
import { fmtHourLabel, minutesSinceMidnight, todayLocal, weekdayKey } from '@/lib/dates'
import { getThisFullWeekDays } from '@/lib/weekDays'

const SLOT_MIN = 30
const SLOT_H = 40 // px per 30-min slot — tall enough that a single 30-min block's title+sub stay legible

const LEGEND = [
  { color: 'var(--blue)', label: 'Class' },
  { color: 'var(--green)', label: 'Deep work' },
  { color: 'var(--pink)', label: 'Family' },
  { color: 'var(--violet)', label: 'Church' },
  { color: 'var(--gold)', label: 'Gym' },
  { color: 'var(--text-faint)', label: 'Commute / No-phone' },
]

export function WeekView({
  template,
  weekdayUniversities,
  universities,
}: {
  template: DashboardTemplate
  weekdayUniversities: Partial<Record<FullWeekday, University[]>>
  universities: University[]
}) {
  const blocks = template.recurring_blocks
  const todayKey = weekdayKey(todayLocal())
  const days = getThisFullWeekDays(template)

  const startSlots = blocks.length ? blocks.map((b) => Math.floor(minutesSinceMidnight(b.start) / SLOT_MIN)) : [14]
  const endSlots = blocks.length ? blocks.map((b) => Math.ceil(minutesSinceMidnight(b.end) / SLOT_MIN)) : [40]
  const slotStart = Math.max(0, Math.min(...startSlots))
  const slotEnd = Math.min(48, Math.max(...endSlots))
  const slots = Array.from({ length: slotEnd - slotStart }, (_, i) => slotStart + i)

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
            const schools = weekdayUniversities[d.weekday] ?? []
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

          {slots.map((slot) => {
            const minutes = slot * SLOT_MIN
            const isHalf = minutes % 60 !== 0
            return (
              <Fragment key={slot}>
                <div className={`time-label${isHalf ? ' half' : ''}`}>
                  {!isHalf && fmtHourLabel(`${Math.floor(minutes / 60)}:00`)}
                </div>
                {days.map((d) => {
                  const cellBlocks = blocks.filter(
                    (b) => b.day === d.weekday && Math.floor(minutesSinceMidnight(b.start) / SLOT_MIN) === slot
                  )
                  return (
                    <div className={`gcell${isHalf ? ' half' : ''}`} key={`${d.weekday}-${slot}`}>
                      {cellBlocks.map((b, i) => {
                        const durationMin = minutesSinceMidnight(b.end) - minutesSinceMidnight(b.start)
                        const spanSlots = durationMin / SLOT_MIN
                        const uni = logoFor(b.university)
                        return (
                          <div
                            key={i}
                            className={`block b-${b.type}`}
                            style={{
                              height: `${SLOT_H * spanSlots - 4}px`,
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
            )
          })}
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
