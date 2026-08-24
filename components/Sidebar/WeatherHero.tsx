'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { DashboardTemplate, University, Weekday } from '@/lib/types'
import { getThisWeekDays } from '@/lib/weekDays'
import { useWeather } from '@/lib/useWeather'
import { weatherBackgroundUrl } from '@/lib/weatherImages'

const REVERT_MS = 5000

export function WeatherHero({
  template,
  weekdayUniversities,
}: {
  template: DashboardTemplate
  weekdayUniversities: Partial<Record<Weekday, University[]>>
}) {
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
  const schools = viewedDay ? (weekdayUniversities[viewedDay.weekday] ?? []) : []

  return (
    <div className="weather-hero">
      <div key={flipKey} className="weather-hero-content">
        <div className="weather-hero-bg" style={{ backgroundImage: `url(${weatherBackgroundUrl(w?.iconCode ?? null)})` }} />
        <div className="weather-hero-overlay" />
        {schools.length > 0 && (
          <div className="wh-schools">
            {schools.map((uni) => (
              <a key={uni.abbr} href={uni.url} target="_blank" rel="noopener noreferrer" title={`${uni.name} portal`}>
                <Image src={uni.logo} alt={uni.name} width={26} height={26} unoptimized />
              </a>
            ))}
          </div>
        )}
        <div className="weather-hero-info">
          <div className="wh-loc">
            <div className="wh-city">{viewedDay?.cityDisplay || 'No city set'}</div>
            <div className="wh-date">{dateLabel}</div>
          </div>
          <div className="wh-temps">
            <span className="wh-icon">{w?.icon ?? '·'}</span>
            <span className="wh-ampm">
              <b>AM</b>
              {w?.am != null ? `${w.am}°` : '—'}
              {w?.popAm != null && <i className="wh-pop">{w.popAm}%</i>}
            </span>
            <span className="wh-ampm">
              <b>PM</b>
              {w?.pm != null ? `${w.pm}°` : '—'}
              {w?.popPm != null && <i className="wh-pop">{w.popPm}%</i>}
            </span>
          </div>
          {w?.rainNote && <div className="wh-rain-note">☂ {w.rainNote}</div>}
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
