'use client'

import { useEffect, useState } from 'react'

export interface WeatherResult {
  am: number | null
  pm: number | null
  icon: string | null
  iconCode: string | null
  condition: string | null
  rain: boolean
  configured: boolean
}

export interface WeatherQuery {
  key: string
  city: string
  date: string
}

export function useWeather(queries: WeatherQuery[]) {
  const [results, setResults] = useState<Record<string, WeatherResult>>({})
  const depKey = queries.map((q) => `${q.key}:${q.city}:${q.date}`).join('|')

  useEffect(() => {
    let cancelled = false
    queries.forEach(async (q) => {
      try {
        const res = await fetch(`/api/weather?city=${encodeURIComponent(q.city)}&date=${q.date}`)
        const data = (await res.json()) as WeatherResult
        if (!cancelled) setResults((prev) => ({ ...prev, [q.key]: data }))
      } catch {
        if (!cancelled)
          setResults((prev) => ({
            ...prev,
            [q.key]: { am: null, pm: null, icon: null, iconCode: null, condition: null, rain: false, configured: true },
          }))
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey])

  return results
}
