'use client'

import { useEffect, useState } from 'react'
import type { HometownConfig } from '@/lib/types'
import { useWeather } from '@/lib/useWeather'
import { ymd } from '@/lib/dates'

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
  const configured = Boolean(hometown.city)
  const time = useClock(hometown.timezone)
  const today = ymd(new Date())
  const weather = useWeather(
    configured ? [{ key: 'home', city: hometown.city, date: today, country: hometown.country, state: hometown.state }] : []
  )
  const w = weather.home

  return (
    <div style={{ position: 'relative' }}>
      <button className="icon-btn" onClick={() => setOpen((o) => !o)} title="Hometown">
        🇺🇸
      </button>
      {open && (
        <div className="hometown-menu">
          {!configured ? (
            <div className="hometown-empty">Set your hometown in _data/hometown.yml</div>
          ) : (
            <>
              <div className="hometown-title">{hometown.label}</div>
              <div className="hometown-place">
                {hometown.city}
                {hometown.state ? `, ${hometown.state}` : ''}
              </div>
              <div className="hometown-time">{time}</div>
              <div className="hometown-weather">
                <span className="wi">{w?.icon ?? '·'}</span>
                <span>
                  <b>AM</b>
                  {w?.am != null ? `${w.am}°` : '—'}
                </span>
                <span>
                  <b>PM</b>
                  {w?.pm != null ? `${w.pm}°` : '—'}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
