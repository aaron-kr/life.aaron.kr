'use client'

import type { TicketRoute } from '@/lib/types'
import { useTickets } from '@/lib/firestore-hooks'
import { addDays, nextWeekdayOccurrence, todayLocal, ticketWindowBucket, ymd } from '@/lib/dates'
import { TicketCard, type TicketRow } from './TicketCard'

interface Occurrence {
  route: TicketRoute
  date: Date
  ticketId: string
}

function occurrencesFor(route: TicketRoute, today: Date): Occurrence[] {
  const out: Occurrence[] = []
  let d = nextWeekdayOccurrence(today, route.weekday)
  while (d.getTime() - today.getTime() <= 28 * 86400000) {
    out.push({ route, date: d, ticketId: `${route.id}_${ymd(d)}` })
    d = addDays(d, 7)
  }
  return out
}

export function TicketDrawer({
  routes,
  open,
  onClose,
}: {
  routes: TicketRoute[]
  open: boolean
  onClose: () => void
}) {
  const { tickets, save, undo } = useTickets()
  const today = todayLocal()

  const buckets: Record<'this' | 'next' | 'later', Occurrence[]> = { this: [], next: [], later: [] }
  routes.forEach((route) => {
    occurrencesFor(route, today).forEach((occ) => {
      const bucket = ticketWindowBucket(occ.date, today)
      if (bucket) buckets[bucket].push(occ)
    })
  })

  function toRow(occ: Occurrence): TicketRow {
    const daysOut = Math.round((occ.date.getTime() - today.getTime()) / 86400000)
    const urgent = occ.route.urgent_within_days != null && daysOut <= occ.route.urgent_within_days
    const dateLabel = occ.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return {
      id: occ.ticketId,
      label: occ.route.route,
      short: occ.route.short,
      meta: `${dateLabel}${occ.route.note ? ' — ' + occ.route.note : ''}`,
      urgent,
      state: tickets[occ.ticketId],
    }
  }

  const sections: { label: string; rows: TicketRow[] }[] = [
    { label: 'This week', rows: buckets.this.map(toRow) },
    { label: 'Next week', rows: buckets.next.map(toRow) },
    { label: '3–4 weeks out', rows: buckets.later.map(toRow) },
  ]
  return (
    <>
      <div className={`ticket-drawer${open ? ' open' : ''}`}>
        <div className="drawer-head">
          <h3>Tickets</h3>
          <button className="drawer-close" onClick={onClose}>
            ✕
          </button>
        </div>
        {routes.length === 0 && <div className="drawer-empty">No recurring routes declared in _data/tickets.yml yet.</div>}
        {sections.map(
          (s) =>
            s.rows.length > 0 && (
              <div key={s.label}>
                <div className="tw-label">
                  {s.label}
                  <div className="bar" />
                </div>
                <TicketCard
                  title="Routes"
                  rows={s.rows}
                  onSave={(id, time, seat) => void save(id, time, seat)}
                  onUndo={(id) => void undo(id)}
                />
              </div>
            )
        )}
      </div>
    </>
  )
}

export function useTicketBadgeCount(routes: TicketRoute[]): number {
  const { tickets } = useTickets()
  const today = todayLocal()
  let count = 0
  routes.forEach((route) => {
    occurrencesFor(route, today).forEach((occ) => {
      if (ticketWindowBucket(occ.date, today) && !tickets[occ.ticketId]?.purchased) count++
    })
  })
  return count
}
