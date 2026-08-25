'use client'

import { useState } from 'react'
import type { TicketState } from '@/lib/firestore-hooks'

export interface TicketRow {
  id: string // `${routeId}_${ymd}`
  label: string
  short: string
  meta: string
  urgent: boolean
  state?: TicketState
}

interface TicketCardProps {
  title: string
  rows: TicketRow[]
  onSave: (id: string, time: string, seat: string) => void
  onDismiss: (id: string) => void
}

// Purchased/dismissed rows never reach this card — TicketDrawer routes those
// into the "Complete" section instead, so every row here is still active.
export function TicketCard({ title, rows, onSave, onDismiss }: TicketCardProps) {
  return (
    <div className="checklist-card">
      <h4>{title}</h4>
      <div>
        {rows.map((row) => (
          <TicketItemRow key={row.id} row={row} onSave={onSave} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  )
}

function TicketItemRow({
  row,
  onSave,
  onDismiss,
}: {
  row: TicketRow
  onSave: (id: string, time: string, seat: string) => void
  onDismiss: (id: string) => void
}) {
  const [checked, setChecked] = useState(false)
  const [time, setTime] = useState('')
  const [seat, setSeat] = useState('')

  function handleSave() {
    onSave(row.id, time || '—', seat || '—')
  }

  return (
    <div className={`cl-item ticket-row${row.urgent ? ' urgent' : ''}`}>
      <input type="checkbox" checked={checked} onChange={() => setChecked(true)} />
      <div style={{ flex: 1 }}>
        <div className="ti-text">
          <span className="ti-route">{row.label}</span>
          <span className="ti-meta">{row.meta}</span>
        </div>
        {checked && (
          <div className="ti-form show">
            <input type="text" placeholder="time e.g. 7:10a" value={time} onChange={(e) => setTime(e.target.value)} />
            <input type="text" placeholder="seat #" value={seat} onChange={(e) => setSeat(e.target.value)} />
            <button onClick={handleSave}>Save</button>
          </div>
        )}
      </div>
      <button
        className="ticket-dismiss"
        onClick={() => onDismiss(row.id)}
        title="Not traveling this one — dismiss without entering purchase details"
      >
        ×
      </button>
    </div>
  )
}
