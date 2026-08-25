'use client'

import { useState } from 'react'
import type { DashboardData, FullWeekday, University } from '@/lib/types'
import { WeatherHero } from './WeatherHero'
import { HabitHeatmaps } from './HabitHeatmaps'
import { EtfRow } from './EtfRow'
import { GoalAccordions } from './GoalAccordions'

export function Sidebar({
  data,
  weekdayUniversities,
  mobileOpen,
  onMobileClose,
}: {
  data: DashboardData
  weekdayUniversities: Partial<Record<FullWeekday, University[]>>
  mobileOpen: boolean
  onMobileClose: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="sidebar-wrap">
      <div className={`sidebar-backdrop${mobileOpen ? ' show' : ''}`} onClick={onMobileClose} />
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="sb-section hide-on-collapse">
          <h2>This Week</h2>
          <WeatherHero template={data.template} weekdayUniversities={weekdayUniversities} />
        </div>

        <HabitHeatmaps habits={data.habits} />
        <EtfRow etfs={data.etfs} />
        <GoalAccordions goalLists={data.goalLists} />
      </aside>
      <button className="collapse-btn" onClick={() => setCollapsed((c) => !c)}>
        {collapsed ? '›' : '‹'}
      </button>
    </div>
  )
}
