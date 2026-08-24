'use client'

import { useEffect, useState } from 'react'

export interface WeatherResult {
  am: number | null
  pm: number | null
  icon: string | null
  iconCode: string | null
  condition: string | null
  rain: boolean
  popAm: number | null
  popPm: number | null
  rainNote: string | null
  configured: boolean
}

const EMPTY_RESULT: WeatherResult = {
  am: null,
  pm: null,
  icon: null,
  iconCode: null,
  condition: null,
  rain: false,
  popAm: null,
  popPm: null,
  rainNote: null,
  configured: true,
}

export interface WeatherQuery {
  key: string
  city: string
  date: string
  country?: string
  state?: string
}

export function useWeather(queries: WeatherQuery[]) {
  const [results, setResults] = useState<Record<string, WeatherResult>>({})
  const depKey = queries.map((q) => `${q.key}:${q.city}:${q.date}:${q.country ?? ''}:${q.state ?? ''}`).join('|')

  useEffect(() => {
    let cancelled = false
    queries.forEach(async (q) => {
      try {
        const params = new URLSearchParams({ city: q.city, date: q.date })
        if (q.country) params.set('country', q.country)
        if (q.state) params.set('state', q.state)
        const res = await fetch(`/api/weather?${params.toString()}`)
        const data = (await res.json()) as WeatherResult
        if (!cancelled) setResults((prev) => ({ ...prev, [q.key]: data }))
      } catch {
        if (!cancelled) setResults((prev) => ({ ...prev, [q.key]: EMPTY_RESULT }))
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey])

  return results
}
