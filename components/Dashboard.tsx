'use client'

import { useEffect, useMemo, useState } from 'react'
import type { DashboardData, View } from '@/lib/types'
import { buildWeekdayUniversities } from '@/lib/weekdayUniversities'
import { useUiSettings } from '@/lib/firestore-hooks'
import { SiteNav } from './SiteNav'
import { Header } from './Header'
import { QuoteBanner } from './QuoteBanner'
import { Sidebar } from './Sidebar/Sidebar'
import { StatsStrip } from './StatsStrip'
import { WeekView } from './views/WeekView'
import { MonthView } from './views/MonthView'
import { SemesterView } from './views/SemesterView'
import { TodoView } from './views/TodoView'
import { BusinessView } from './views/BusinessView'
import { JobsView } from './views/JobsView'
import { TicketDrawer } from './Checklist/TicketDrawer'
import { Footer } from './Footer'

export function Dashboard({ data }: { data: DashboardData }) {
  const [view, setViewState] = useState<View>('week')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { lastView, setLastView, statsCollapsed, setStatsCollapsed } = useUiSettings()

  // Carries the active view across devices/sessions: once Firestore reports
  // the last one used elsewhere, jump to it (a brief flash of Week first is
  // the tradeoff for not blocking the initial render on a Firestore read).
  useEffect(() => {
    if (lastView) setViewState(lastView)
  }, [lastView])

  function toggleStatsCollapsed() {
    setStatsCollapsed(!statsCollapsed)
  }

  function setView(v: View) {
    setViewState(v)
    // Fire-and-forget: never let a transient write failure (offline, a
    // not-yet-resolved auth token) surface as an unhandled rejection over
    // something this unimportant.
    setLastView(v).catch(() => {})
  }

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
          logoUrl={data.branding.logoUrl}
        />
        <QuoteBanner quotes={data.quotes} biblePlan={data.biblePlan} />
      </div>
      <Sidebar
        data={data}
        weekdayUniversities={weekdayUniversities}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <main className="content">
        <StatsStrip
          stats={data.stats}
          etfs={data.etfs}
          showEtfs={view === 'business' || view === 'jobs'}
          collapsed={statsCollapsed}
          onToggleCollapsed={toggleStatsCollapsed}
        />
        {view === 'week' && (
          <WeekView
            template={data.template}
            weatherCities={data.weatherCities}
            weekdayUniversities={weekdayUniversities}
            universities={data.universities}
          />
        )}
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
        {view === 'todo' && <TodoView checklists={data.checklists} universities={data.universities} />}
        {view === 'business' && (
          <BusinessView
            deadlines={data.businessDeadlines}
            checklists={data.checklists.filter((c) => c.group === 'Business')}
            universities={data.universities}
          />
        )}
        {view === 'jobs' && (
          <JobsView
            jobs={data.jobs}
            checklists={data.checklists.filter((c) => c.group === 'Jobs')}
            universities={data.universities}
          />
        )}
      </main>
      <Footer />
      <TicketDrawer routes={data.tickets} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
