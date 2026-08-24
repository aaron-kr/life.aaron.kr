'use client'

import { useState } from 'react'
import type { DashboardData, View } from '@/lib/types'
import { SiteNav } from './SiteNav'
import { Header } from './Header'
import { QuoteBanner } from './QuoteBanner'
import { Sidebar } from './Sidebar/Sidebar'
import { SemesterStatsStrip } from './SemesterStatsStrip'
import { WeekView } from './views/WeekView'
import { MonthView } from './views/MonthView'
import { SemesterView } from './views/SemesterView'
import { TodoView } from './views/TodoView'
import { TicketDrawer } from './Checklist/TicketDrawer'
import { Footer } from './Footer'

export function Dashboard({ data }: { data: DashboardData }) {
  const [view, setView] = useState<View>('week')
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="app">
      <SiteNav />
      <Header view={view} onViewChange={setView} onDrawerOpen={() => setDrawerOpen(true)} tickets={data.tickets} />
      <QuoteBanner quotes={data.quotes} />
      <Sidebar data={data} />
      <main className="content">
        <SemesterStatsStrip stats={data.stats} />
        {view === 'week' && <WeekView template={data.template} />}
        {view === 'month' && <MonthView holidays={data.holidays} events={data.events} />}
        {view === 'semester' && <SemesterView courses={data.courses} />}
        {view === 'todo' && <TodoView checklists={data.checklists} />}
      </main>
      <Footer />
      <TicketDrawer routes={data.tickets} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
