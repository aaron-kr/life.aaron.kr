'use client'

import { useEffect, useRef, useState } from 'react'
import type { DashboardTemplate } from '@/lib/types'
import { getThisWeekDays } from '@/lib/weekDays'
import { useWeather } from '@/lib/useWeather'
import { weatherBackgroundUrl } from '@/lib/weatherImages'

const REVERT_MS = 5000

export function WeatherHero({ template }: { template: DashboardTemplate }) {
  const days = getThisWeekDays(template)
  const todayYmd = days.find((d) => d.isToday)?.dateYmd ?? days[0]?.dateYmd
  const weather = useWeather(days.map((d) => ({ key: d.dateYmd, city: d.city, date: d.dateYmd })))

  const [viewedYmd, setViewedYmd] = useState(todayYmd)
  const [flipKey, setFlipKey] = useState(0)
  const revertTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (revertTimer.current) clearTimeout(revertTimer.current)
    }
  }, [])

  function selectDay(ymd: string) {
    if (ymd === viewedYmd) return
    if (revertTimer.current) clearTimeout(revertTimer.current)
    setViewedYmd(ymd)
    setFlipKey((k) => k + 1)
    if (ymd !== todayYmd) {
      revertTimer.current = setTimeout(() => {
        setViewedYmd(todayYmd)
        setFlipKey((k) => k + 1)
      }, REVERT_MS)
    }
  }

  const viewedDay = days.find((d) => d.dateYmd === viewedYmd) ?? days[0]
  const w = weather[viewedYmd]
  const dateLabel = viewedDay?.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <div className="weather-hero">
      <div key={flipKey} className="weather-hero-content">
        <div className="weather-hero-bg" style={{ backgroundImage: `url(${weatherBackgroundUrl(w?.iconCode ?? null)})` }} />
        <div className="weather-hero-overlay" />
        <div className="weather-hero-info">
          <div className="wh-loc">
            <div className="wh-city">{viewedDay?.city || 'No city set'}</div>
            <div className="wh-date">{dateLabel}</div>
          </div>
          <div className="wh-temps">
            <span className="wh-icon">{w?.icon ?? '·'}</span>
            <span className="wh-ampm">
              <b>AM</b>
              {w?.am != null ? `${w.am}°` : '—'}
            </span>
            <span className="wh-ampm">
              <b>PM</b>
              {w?.pm != null ? `${w.pm}°` : '—'}
            </span>
          </div>
        </div>
      </div>
      <div className="day-strip">
        {days.map((d) => {
          const dw = weather[d.dateYmd]
          return (
            <button
              key={d.dateYmd}
              className={`day-strip-cell${d.dateYmd === viewedYmd ? ' active' : ''}${d.isToday ? ' today' : ''}`}
              onClick={() => selectDay(d.dateYmd)}
            >
              <span className="dsc-label">{d.label[0]}</span>
              <span className="dsc-icon">{dw?.icon ?? '·'}</span>
              <span className="dsc-date">{d.date.getDate()}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
