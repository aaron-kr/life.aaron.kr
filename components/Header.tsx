'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/lib/auth-context'
import type { TicketRoute, View } from '@/lib/types'
import { useTicketBadgeCount } from './Checklist/TicketDrawer'
import { WaveToggleButton } from './WaveToggleButton'

const VIEWS: { id: View; label: string }[] = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'semester', label: 'Semester' },
  { id: 'todo', label: 'To-Do' },
]

export function Header({
  view,
  onViewChange,
  onDrawerOpen,
  tickets,
}: {
  view: View
  onViewChange: (v: View) => void
  onDrawerOpen: () => void
  tickets: TicketRoute[]
}) {
  const { user, signOutUser } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const badgeCount = useTicketBadgeCount(tickets)
  const initials = (user?.displayName ?? user?.email ?? '?').slice(0, 2).toUpperCase()

  return (
    <header className="top">
      <div className="brand">
        <div className="mark">AS</div>
        <div>
          <h1>Compass</h1>
          <div className="sub">Personal Dashboard</div>
        </div>
      </div>
      <div className="header-right">
        <div className="view-toggle">
          {VIEWS.map((v) => (
            <button key={v.id} className={view === v.id ? 'active' : ''} onClick={() => onViewChange(v.id)}>
              {v.label}
            </button>
          ))}
        </div>
        <WaveToggleButton />
        <button className="icon-btn" onClick={onDrawerOpen} title="Ticket checklist">
          🎫{badgeCount > 0 && <span className="badge">{badgeCount}</span>}
        </button>
        <div style={{ position: 'relative' }}>
          <div className="account" onClick={() => setMenuOpen((m) => !m)}>
            {user?.photoURL ? <Image src={user.photoURL} alt="" width={32} height={32} /> : initials}
          </div>
          {menuOpen && (
            <div className="account-menu">
              <button onClick={signOutUser}>Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
