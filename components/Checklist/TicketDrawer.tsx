'use client'

import { useState } from 'react'
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
    const dYmd = ymd(d)
    if (!route.start_date || dYmd >= route.start_date) {
      out.push({ route, date: d, ticketId: `${route.id}_${dYmd}` })
    }
    d = addDays(d, 7)
  }
  return out
}

function byDateAsc(a: Occurrence, b: Occurrence) {
  return a.date.getTime() - b.date.getTime()
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
  const { tickets, save, dismiss, undo } = useTickets()
  const [showComplete, setShowComplete] = useState(false)
  const today = todayLocal()

  const buckets: Record<'this' | 'next' | 'later', Occurrence[]> = { this: [], next: [], later: [] }
  const complete: Occurrence[] = []
  routes.forEach((route) => {
    occurrencesFor(route, today).forEach((occ) => {
      const state = tickets[occ.ticketId]
      if (state?.purchased || state?.dismissed) {
        complete.push(occ)
        return
      }
      const bucket = ticketWindowBucket(occ.date, today)
      if (bucket) buckets[bucket].push(occ)
    })
  })
  buckets.this.sort(byDateAsc)
  buckets.next.sort(byDateAsc)
  buckets.later.sort(byDateAsc)
  complete.sort(byDateAsc)

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
  const completeRows = complete.map(toRow)

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
                  onDismiss={(id) => void dismiss(id)}
                />
              </div>
            )
        )}
        {completeRows.length > 0 && (
          <div>
            <div className="done-toggle" onClick={() => setShowComplete((s) => !s)}>
              <span>{completeRows.length}</span> complete — click to {showComplete ? 'collapse' : 'expand'}{' '}
              {showComplete ? '▴' : '▾'}
            </div>
            <div className={`done-list${showComplete ? ' show' : ''}`}>
              {completeRows.map((row) => (
                <div className="done-item" key={row.id}>
                  <span>
                    {row.state?.purchased ? '✓' : '—'} {row.short} · {row.meta}
                    {row.state?.purchased && row.state.time ? ` · ${row.state.time}` : ''}
                    {row.state?.dismissed ? ' (dismissed)' : ''}
                  </span>
                  <button className="rm" onClick={() => void undo(row.id)} title="Bring back">
                    undo
                  </button>
                </div>
              ))}
            </div>
          </div>
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
      const state = tickets[occ.ticketId]
      if (ticketWindowBucket(occ.date, today) && !state?.purchased && !state?.dismissed) count++
    })
  })
  return count
}
