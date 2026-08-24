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
  onUndo: (id: string) => void
}

export function TicketCard({ title, rows, onSave, onUndo }: TicketCardProps) {
  return (
    <div className="checklist-card">
      <h4>{title}</h4>
      <div>
        {rows.map((row) => (
          <TicketItemRow key={row.id} row={row} onSave={onSave} onUndo={onUndo} />
        ))}
      </div>
    </div>
  )
}

function TicketItemRow({
  row,
  onSave,
  onUndo,
}: {
  row: TicketRow
  onSave: (id: string, time: string, seat: string) => void
  onUndo: (id: string) => void
}) {
  const [checked, setChecked] = useState(Boolean(row.state?.purchased))
  const [time, setTime] = useState('')
  const [seat, setSeat] = useState('')
  const purchased = Boolean(row.state?.purchased)

  function handleCheck() {
    setChecked(true)
  }

  function handleSave() {
    onSave(row.id, time || '—', seat || '—')
  }

  function handleUndo() {
    onUndo(row.id)
    setChecked(false)
    setTime('')
    setSeat('')
  }

  if (purchased) {
    return (
      <div className="cl-item collapsed">
        <div className="ti-text">
          <span className="ti-route">{row.label}</span>
          <span className="ti-meta">{row.meta}</span>
        </div>
        <span className="ticket-chip">
          ✓ {row.short} · {row.state?.time}
          <button className="undo-link" onClick={handleUndo}>
            undo
          </button>
        </span>
      </div>
    )
  }

  return (
    <div className={`cl-item${row.urgent ? ' urgent' : ''}`}>
      <input type="checkbox" checked={checked} onChange={handleCheck} />
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
    </div>
  )
}
