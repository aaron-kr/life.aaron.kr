'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/lib/auth-context'
import type { HometownConfig, TicketRoute, View } from '@/lib/types'
import { useTicketBadgeCount } from './Checklist/TicketDrawer'
import { WaveToggleButton } from './WaveToggleButton'
import { HometownWidget } from './HometownWidget'
import { DropdownPortal } from './DropdownPortal'
import { BrandMark } from './BrandMark'

const VIEWS: { id: View; label: string }[] = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'semester', label: 'Semester' },
  { id: 'todo', label: 'To-Do' },
  { id: 'jobs', label: 'Jobs' },
]

export function Header({
  view,
  onViewChange,
  onDrawerOpen,
  onHamburgerClick,
  tickets,
  hometown,
  logoUrl,
}: {
  view: View
  onViewChange: (v: View) => void
  onDrawerOpen: () => void
  onHamburgerClick: () => void
  tickets: TicketRoute[]
  hometown: HometownConfig
  logoUrl?: string
}) {
  const { user, signOutUser } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)
  const badgeCount = useTicketBadgeCount(tickets)
  const initials = (user?.displayName ?? user?.email ?? '?').slice(0, 2).toUpperCase()

  return (
    <header className="top">
      <div className="brand">
        <button className="icon-btn hamburger-btn" onClick={onHamburgerClick} title="Menu" aria-label="Toggle sidebar">
          ☰
        </button>
        <BrandMark logoUrl={logoUrl} />
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
        <HometownWidget hometown={hometown} />
        <button className="icon-btn" onClick={onDrawerOpen} title="Ticket checklist">
          🎫{badgeCount > 0 && <span className="badge">{badgeCount}</span>}
        </button>
        <div>
          <div className="account" ref={accountRef} onClick={() => setMenuOpen((m) => !m)}>
            {user?.photoURL ? <Image src={user.photoURL} alt="" width={32} height={32} /> : initials}
          </div>
          <DropdownPortal anchorRef={accountRef} open={menuOpen} align="right">
            <div className="account-menu">
              <button onClick={signOutUser}>Sign out</button>
            </div>
          </DropdownPortal>
        </div>
      </div>
    </header>
  )
}
