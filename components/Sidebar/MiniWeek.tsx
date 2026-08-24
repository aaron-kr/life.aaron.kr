'use client'

import { useState } from 'react'
import type { DashboardTemplate } from '@/lib/types'
import { getThisWeekDays } from '@/lib/weekDays'
import { useWeather } from '@/lib/useWeather'

export function MiniWeek({ template }: { template: DashboardTemplate }) {
  const days = getThisWeekDays(template)
  const [openKey, setOpenKey] = useState<string | null>(null)
  const weather = useWeather(days.map((d) => ({ key: d.dateYmd, city: d.city, date: d.dateYmd })))

  return (
    <div className="mini-week">
      {days.map((d) => {
        const w = weather[d.dateYmd]
        return (
          <div
            key={d.dateYmd}
            className={`d${d.isToday ? ' today' : ''}`}
            onMouseEnter={() => setOpenKey(d.dateYmd)}
            onMouseLeave={() => setOpenKey(null)}
          >
            <span>{d.label[0]}</span>
            <span className="wi">{w?.icon ?? '·'}</span>
            <span className="n">{d.date.getDate()}</span>
            <div className={`wpop${openKey === d.dateYmd ? ' show' : ''}`}>
              <div className="wtitle">
                {d.label} · {d.city || 'no city set'}
              </div>
              <div className="wrow">
                <span>AM</span>
                <span>{w?.am != null ? `${w.am}°` : '—'}</span>
              </div>
              <div className="wrow">
                <span>PM</span>
                <span>{w?.pm != null ? `${w.pm}°` : '—'}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
