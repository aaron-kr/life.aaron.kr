import Image from 'next/image'
import type { FullWeekday, HolidayEntry, PersonalEvent, University, Weekday } from '@/lib/types'
import { addDays, rollingMonthGridStart, sameDate, todayLocal, ymd } from '@/lib/dates'

const DOW_HEADS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DOW_WEEKDAY_KEY: (Weekday | null)[] = [null, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', null]

const FLAG_LABEL: Record<PersonalEvent['type'], string> = {
  family: 'family',
  church: 'church',
  event: 'event',
  deadline: 'deadline',
  conference: '학회',
  ticket: 'tickets',
}
const FLAG_CLASS: Record<PersonalEvent['type'], string> = {
  family: 'flag-event',
  church: 'flag-event',
  event: 'flag-event',
  deadline: 'flag-deadline',
  conference: 'flag-conf',
  ticket: 'flag-ticket',
}
const PILL_COLOR: Record<PersonalEvent['type'], string> = {
  family: 'var(--green)',
  church: 'var(--gold)',
  event: 'var(--teal)',
  deadline: 'var(--pink)',
  conference: 'var(--gold)',
  ticket: 'var(--violet)',
}

interface PillSegment {
  event: PersonalEvent
  row: number
  colStart: number
  colEnd: number
  lane: number
}

/** Multi-day events (those with end_date) become a bar spanning columns
 * instead of a per-day badge. A trip crossing a week boundary becomes two
 * segments — one per row — computed by walking week by week. `lane` stacks
 * concurrent multi-day events in the same row instead of overlapping them. */
function computeSegments(events: PersonalEvent[], gridStart: Date): PillSegment[] {
  const gridEnd = addDays(gridStart, 41)
  const segments: PillSegment[] = []

  events
    .filter((e) => e.end_date)
    .forEach((event) => {
      const startDate = new Date(`${event.date}T00:00:00`)
      const endDate = new Date(`${event.end_date}T00:00:00`)
      const clippedStart = startDate < gridStart ? gridStart : startDate
      const clippedEnd = endDate > gridEnd ? gridEnd : endDate
      if (clippedStart > clippedEnd) return

      let cursor = clippedStart
      while (cursor <= clippedEnd) {
        const idx = Math.round((cursor.getTime() - gridStart.getTime()) / 86400000)
        const row = Math.floor(idx / 7)
        const rowEndDate = addDays(gridStart, row * 7 + 6)
        const segEnd = clippedEnd < rowEndDate ? clippedEnd : rowEndDate
        const segEndIdx = Math.round((segEnd.getTime() - gridStart.getTime()) / 86400000)
        segments.push({ event, row, colStart: idx % 7, colEnd: segEndIdx % 7, lane: 0 })
        cursor = addDays(segEnd, 1)
      }
    })

  // Assign a lane per row so overlapping segments stack instead of collide.
  const rowLaneEnd: Record<number, number[]> = {}
  segments
    .sort((a, b) => a.colStart - b.colStart)
    .forEach((seg) => {
      const lanes = rowLaneEnd[seg.row] ?? (rowLaneEnd[seg.row] = [])
      let lane = lanes.findIndex((end) => end < seg.colStart)
      if (lane === -1) lane = lanes.length
      lanes[lane] = seg.colEnd
      seg.lane = lane
    })

  return segments
}

export function MonthView({
  holidays,
  events,
  weekdayUniversities,
}: {
  holidays: HolidayEntry[]
  events: PersonalEvent[]
  weekdayUniversities: Partial<Record<FullWeekday, University[]>>
}) {
  const today = todayLocal()
  const gridStart = rollingMonthGridStart(today)
  const currentMonth = today.getMonth()

  const holidayMap = new Map(holidays.map((h) => [h.date, h]))
  const eventsByDate = new Map<string, PersonalEvent[]>()
  events
    .filter((e) => !e.end_date)
    .forEach((e) => {
      const list = eventsByDate.get(e.date) ?? []
      list.push(e)
      eventsByDate.set(e.date, list)
    })
  const segments = computeSegments(events, gridStart)

  const monthNames = new Set<string>()
  const cells = Array.from({ length: 42 }, (_, i) => {
    const date = addDays(gridStart, i)
    monthNames.add(date.toLocaleString('en-US', { month: 'long' }))
    return date
  })

  return (
    <section className="panel active">
      <div className="card">
        <h3>
          {Array.from(monthNames).join(' → ')}{' '}
          <span className="pill">holidays.yml + personal-events.yml</span>
        </h3>
        <div className="month-grid">
          {DOW_HEADS.map((d, i) => {
            const wdKey = DOW_WEEKDAY_KEY[i]
            const schools = wdKey ? (weekdayUniversities[wdKey] ?? []) : []
            return (
              <div key={d} className={`mhead${i === 0 ? ' sun' : i === 6 ? ' sat' : ''}`}>
                {d}
                {schools.length > 0 && (
                  <div className="mhead-logos">
                    {schools.map((uni) => (
                      <a key={uni.abbr} href={uni.url} target="_blank" rel="noopener noreferrer" title={`${uni.name} portal`}>
                        <Image src={uni.logo} alt={uni.name} width={16} height={16} unoptimized />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {cells.map((date) => {
            const key = ymd(date)
            const dow = date.getDay()
            const inFocalMonth = date.getMonth() === currentMonth
            const holiday = holidayMap.get(key)
            const dayEvents = eventsByDate.get(key) ?? []
            let numClass = 'mnum'
            if (dow === 0) numClass += ' sun'
            if (dow === 6) numClass += ' sat'
            if (holiday && !holiday.makeup) numClass += ' holiday'
            if (holiday?.makeup) numClass += ' makeup'

            return (
              <div
                key={key}
                className={`mcell${inFocalMonth ? '' : ' dim'}${sameDate(date, today) ? ' today' : ''}`}
              >
                <div className={numClass} title={holiday?.label ?? ''}>
                  {date.getDate()}
                </div>
                <div className="mflags">
                  {dayEvents.map((e, i) => (
                    <span key={i} className={`mflag ${FLAG_CLASS[e.type]}`} title={e.label}>
                      {FLAG_LABEL[e.type]}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
          {segments.map((seg, i) => (
            <div
              key={i}
              className="month-pill"
              style={{
                gridRow: seg.row + 2,
                gridColumn: `${seg.colStart + 1} / ${seg.colEnd + 2}`,
                marginTop: `${24 + seg.lane * 16}px`,
                background: `color-mix(in srgb, ${PILL_COLOR[seg.event.type]} 35%, var(--panel-2))`,
                borderColor: PILL_COLOR[seg.event.type],
              }}
              title={seg.event.label}
            >
              {seg.event.label}
            </div>
          ))}
        </div>
        <div className="legend">
          <div className="lg-item">
            <span className="mflag flag-deadline">deadline</span>Paper / abstract
          </div>
          <div className="lg-item">
            <span className="mflag flag-conf">학회</span>Conference
          </div>
          <div className="lg-item">
            <span className="mflag flag-ticket">ticket</span>Buy-by reminder
          </div>
          <div className="lg-item">
            <span className="mflag flag-event">family</span>Family / church event
          </div>
          <div className="lg-item">
            <span className="month-pill-swatch" />
            Multi-day (set end_date)
          </div>
          <div className="lg-item">
            <span style={{ color: 'var(--red)' }}>●</span>Sunday / holiday
          </div>
          <div className="lg-item">
            <span style={{ color: 'var(--yellow)' }}>●</span>Make-up day
          </div>
        </div>
      </div>
    </section>
  )
}
