'use client'

import { useState } from 'react'
import type { DashboardData } from '@/lib/types'
import { MiniWeek } from './MiniWeek'
import { BodyStats } from './BodyStats'
import { HabitHeatmaps } from './HabitHeatmaps'
import { SemesterStats } from './SemesterStats'
import { GoalAccordions } from './GoalAccordions'

export function Sidebar({ data }: { data: DashboardData }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <button className="collapse-btn" onClick={() => setCollapsed((c) => !c)}>
        ‹
      </button>

      <div className="sb-section hide-on-collapse">
        <h2>This Week</h2>
        <MiniWeek template={data.template} />
      </div>

      <BodyStats stats={data.stats} />
      <HabitHeatmaps habits={data.habits} />
      <SemesterStats stats={data.stats} />
      <GoalAccordions goalLists={data.goalLists} />
    </aside>
  )
}
