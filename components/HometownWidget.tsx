'use client'

import { useEffect, useRef, useState } from 'react'
import type { HometownConfig } from '@/lib/types'
import { useWeather } from '@/lib/useWeather'
import { ymd } from '@/lib/dates'
import { weatherBackgroundUrl } from '@/lib/weatherImages'
import { DropdownPortal } from './DropdownPortal'

function useClock(timezone: string) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])
  if (!now) return ''
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      weekday: 'short',
    }).format(now)
  } catch {
    return ''
  }
}

export function HometownWidget({ hometown }: { hometown: HometownConfig }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const configured = Boolean(hometown.city)
  const time = useClock(hometown.timezone)
  const today = ymd(new Date())
  const weather = useWeather(
    configured ? [{ key: 'home', city: hometown.city, date: today, country: hometown.country, state: hometown.state }] : []
  )
  const w = weather.home

  return (
    <div>
      <button className="icon-btn flag-emoji" ref={btnRef} onClick={() => setOpen((o) => !o)} title="Hometown">
        🇺🇸
      </button>
      <DropdownPortal anchorRef={btnRef} open={open} align="right">
        <div className="hometown-panel">
          {!configured ? (
            <div className="hometown-empty">Set your hometown in _data/hometown.yml</div>
          ) : (
            <div className="weather-hero-content" style={{ animation: 'none' }}>
              <div className="weather-hero-bg" style={{ backgroundImage: `url(${weatherBackgroundUrl(w?.iconCode ?? null)})` }} />
              <div className="weather-hero-overlay" />
              <div className="weather-hero-info">
                <div className="wh-loc">
                  <div className="wh-city">
                    {hometown.city}
                    {hometown.state ? `, ${hometown.state}` : ''}
                  </div>
                  <div className="wh-date">
                    {hometown.label} · {time}
                  </div>
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
          )}
        </div>
      </DropdownPortal>
    </div>
  )
}
