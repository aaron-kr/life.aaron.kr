'use client'

import type { DashboardTemplate } from '@/lib/types'
import { getThisWeekDays } from '@/lib/weekDays'
import { useWeather } from '@/lib/useWeather'

export function StickyWeatherStrip({ template }: { template: DashboardTemplate }) {
  const days = getThisWeekDays(template)
  const weather = useWeather(days.map((d) => ({ key: d.dateYmd, city: d.city, date: d.dateYmd })))

  return (
    <div className="sticky-strip">
      <div className="strip-inner">
        {days.map((d) => {
          const w = weather[d.dateYmd]
          return (
            <div key={d.dateYmd} className={`strip-day${d.isToday ? ' today' : ''}`}>
              <div className="sd-l">
                <div className="sd-wd">{d.label}</div>
                <div className="sd-city">{d.city || '—'}</div>
              </div>
              <div className="sd-ampm">
                <span>
                  <b>AM</b>
                  {w?.am != null ? `${w.am}°` : '—'}
                </span>
                <span>
                  <b>PM</b>
                  {w?.pm != null ? `${w.pm}°` : '—'}
                </span>
              </div>
              {w?.rain ? (
                <span className="rain">🌧️</span>
              ) : (
                <span className="wi" style={{ fontSize: 14 }}>
                  {w?.icon ?? ''}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
