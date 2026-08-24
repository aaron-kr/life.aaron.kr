'use client'

import { useMemo, useState } from 'react'
import type { DashboardData, View } from '@/lib/types'
import { buildWeekdayUniversities } from '@/lib/weekdayUniversities'
import { SiteNav } from './SiteNav'
import { Header } from './Header'
import { QuoteBanner } from './QuoteBanner'
import { Sidebar } from './Sidebar/Sidebar'
import { StatsStrip } from './StatsStrip'
import { WeekView } from './views/WeekView'
import { MonthView } from './views/MonthView'
import { SemesterView } from './views/SemesterView'
import { TodoView } from './views/TodoView'
import { TicketDrawer } from './Checklist/TicketDrawer'
import { Footer } from './Footer'

export function Dashboard({ data }: { data: DashboardData }) {
  const [view, setView] = useState<View>('week')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const weekdayUniversities = useMemo(
    () => buildWeekdayUniversities(data.courseSources, data.universities),
    [data.courseSources, data.universities]
  )

  return (
    <div className="app">
      <div className="hero-band">
        <div className="hero-band-bg" />
        <div className="hero-band-overlay" />
        <SiteNav />
        <Header
          view={view}
          onViewChange={setView}
          onDrawerOpen={() => setDrawerOpen(true)}
          onHamburgerClick={() => setMobileSidebarOpen((o) => !o)}
          tickets={data.tickets}
          hometown={data.hometown}
        />
        <QuoteBanner quotes={data.quotes} />
      </div>
      <Sidebar
        data={data}
        weekdayUniversities={weekdayUniversities}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <main className="content">
        <StatsStrip stats={data.stats} />
        {view === 'week' && <WeekView template={data.template} />}
        {view === 'month' && (
          <MonthView holidays={data.holidays} events={data.events} weekdayUniversities={weekdayUniversities} />
        )}
        {view === 'semester' && (
          <SemesterView
            courseSources={data.courseSources}
            courses={data.courses}
            semesterStart={data.semesterStart}
            universities={data.universities}
          />
        )}
        {view === 'todo' && <TodoView checklists={data.checklists} />}
      </main>
      <Footer />
      <TicketDrawer routes={data.tickets} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
