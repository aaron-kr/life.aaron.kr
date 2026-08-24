'use client'

import { useState } from 'react'

export interface ChecklistCardItem {
  id: string
  text: string
  meta?: string
  urgent?: boolean
  done: boolean
}

interface ChecklistCardProps {
  title: string
  items: ChecklistCardItem[]
  onToggle: (id: string, done: boolean) => void
  onRemove: (id: string) => void
}

export function ChecklistCard({ title, items, onToggle, onRemove }: ChecklistCardProps) {
  const [showDone, setShowDone] = useState(false)
  const active = items.filter((i) => !i.done)
  const done = items.filter((i) => i.done)

  return (
    <div className="checklist-card">
      <h4>{title}</h4>
      <div>
        {active.map((item) => (
          <div className={`cl-item${item.urgent ? ' urgent' : ''}`} key={item.id}>
            <input type="checkbox" checked={false} onChange={() => onToggle(item.id, true)} />
            <div className="ti-text">
              <span className="ti-route">{item.text}</span>
              {item.meta && <span className="ti-meta">{item.meta}</span>}
            </div>
          </div>
        ))}
        {active.length === 0 && done.length === 0 && (
          <div className="ti-meta" style={{ padding: '6px 0' }}>
            Nothing here yet.
          </div>
        )}
      </div>
      {done.length > 0 && (
        <>
          <div className="done-toggle" onClick={() => setShowDone((s) => !s)}>
            <span>{done.length}</span> done — click to {showDone ? 'collapse' : 'expand'} {showDone ? '▴' : '▾'}
          </div>
          <div className={`done-list${showDone ? ' show' : ''}`}>
            {done.map((item) => (
              <div className="done-item" key={item.id}>
                <span>{item.text}</span>
                <button className="rm" onClick={() => onRemove(item.id)} title="Remove permanently">
                  ×
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
