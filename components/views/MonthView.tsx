import type { HolidayEntry, PersonalEvent } from '@/lib/types'
import { addDays, rollingMonthGridStart, sameDate, todayLocal, ymd } from '@/lib/dates'

const DOW_HEADS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const FLAG_LABEL: Record<PersonalEvent['type'], string> = {
  hike: 'hike',
  church: 'church',
  event: 'event',
  deadline: 'deadline',
  conference: '학회',
  ticket: 'tickets',
}
const FLAG_CLASS: Record<PersonalEvent['type'], string> = {
  hike: 'flag-event',
  church: 'flag-event',
  event: 'flag-event',
  deadline: 'flag-deadline',
  conference: 'flag-conf',
  ticket: 'flag-ticket',
}

export function MonthView({ holidays, events }: { holidays: HolidayEntry[]; events: PersonalEvent[] }) {
  const today = todayLocal()
  const gridStart = rollingMonthGridStart(today)
  const currentMonth = today.getMonth()

  const holidayMap = new Map(holidays.map((h) => [h.date, h]))
  const eventsByDate = new Map<string, PersonalEvent[]>()
  events.forEach((e) => {
    const list = eventsByDate.get(e.date) ?? []
    list.push(e)
    eventsByDate.set(e.date, list)
  })

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
          {DOW_HEADS.map((d, i) => (
            <div key={d} className={`mhead${i === 0 ? ' sun' : i === 6 ? ' sat' : ''}`}>
              {d}
            </div>
          ))}
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
            <span className="mflag flag-event">hike</span>Family / church event
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
