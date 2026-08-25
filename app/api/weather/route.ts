import { NextRequest, NextResponse } from 'next/server'

interface ForecastEntry {
  dt: number // UTC unix seconds
  main: { temp: number }
  weather: { icon: string; main: string }[]
  pop?: number // probability of precipitation, 0-1
}

interface ForecastResponse {
  list: ForecastEntry[]
  city: { timezone: number } // seconds offset from UTC for the queried location
}

function iconEmoji(code: string): string {
  const map: Record<string, string> = {
    '01': '☀️',
    '02': '⛅',
    '03': '☁️',
    '04': '☁️',
    '09': '🌦️',
    '10': '🌧️',
    '11': '⛈️',
    '13': '❄️',
    '50': '🌫️',
  }
  return map[code.slice(0, 2)] ?? '🌤️'
}

/** OpenWeatherMap's `dt` is UTC. Shifting by the location's own tz offset
 * before reading fields with the UTC getters gives that location's local
 * hour/date without needing a timezone database. */
function localHourAndDate(entry: ForecastEntry, tzOffsetSec: number): { hour: number; dateYmd: string } {
  const local = new Date((entry.dt + tzOffsetSec) * 1000)
  const y = local.getUTCFullYear()
  const m = String(local.getUTCMonth() + 1).padStart(2, '0')
  const d = String(local.getUTCDate()).padStart(2, '0')
  return { hour: local.getUTCHours(), dateYmd: `${y}-${m}-${d}` }
}

function closestTo(entries: ForecastEntry[], dateYmd: string, targetHour: number, tzOffsetSec: number): ForecastEntry | null {
  const sameDay = entries.filter((e) => localHourAndDate(e, tzOffsetSec).dateYmd === dateYmd)
  if (!sameDay.length) return null
  return sameDay.reduce((best, e) => {
    const hour = localHourAndDate(e, tzOffsetSec).hour
    const bestHour = localHourAndDate(best, tzOffsetSec).hour
    return Math.abs(hour - targetHour) < Math.abs(bestHour - targetHour) ? e : best
  }, sameDay[0])
}

function rainNoteFor(amPop: number | null, pmPop: number | null): string | null {
  const amRain = amPop != null && amPop >= 40
  const pmRain = pmPop != null && pmPop >= 40
  if (amRain && pmRain) return 'Rain likely most of the day'
  if (pmRain) return 'Rain likely in the afternoon'
  if (amRain) return 'Rain likely in the morning'
  return null
}

const EMPTY_RESULT = {
  am: null,
  pm: null,
  icon: null,
  iconCode: null,
  condition: null,
  rain: false,
  popAm: null,
  popPm: null,
  rainNote: null,
}

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city')
  const date = req.nextUrl.searchParams.get('date') // YYYY-MM-DD, defaults to today
  const country = req.nextUrl.searchParams.get('country') ?? 'KR' // ISO 3166-1 alpha-2
  const state = req.nextUrl.searchParams.get('state') // optional, US states improve match accuracy
  const apiKey = process.env.OPENWEATHER_API_KEY

  if (!city) return NextResponse.json({ error: 'city is required' }, { status: 400 })
  if (!apiKey) {
    return NextResponse.json({ ...EMPTY_RESULT, configured: false })
  }

  const dateYmd = date ?? new Date().toISOString().slice(0, 10)
  const locationQuery = country === 'US' && state ? `${city},${state},US` : `${city},${country}`

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
      locationQuery
    )}&units=metric&appid=${apiKey}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`OpenWeather ${res.status}`)
    const data = (await res.json()) as ForecastResponse
    const tzOffsetSec = data.city?.timezone ?? 0

    const am = closestTo(data.list, dateYmd, 9, tzOffsetSec)
    const pm = closestTo(data.list, dateYmd, 15, tzOffsetSec)
    const iconSrc = pm ?? am
    const popAm = am?.pop != null ? Math.round(am.pop * 100) : null
    const popPm = pm?.pop != null ? Math.round(pm.pop * 100) : null

    return NextResponse.json({
      am: am ? Math.round(am.main.temp) : null,
      pm: pm ? Math.round(pm.main.temp) : null,
      icon: iconSrc ? iconEmoji(iconSrc.weather[0]?.icon ?? '01d') : null,
      iconCode: iconSrc?.weather[0]?.icon ?? null,
      condition: iconSrc?.weather[0]?.main ?? null,
      rain: iconSrc ? /rain|drizzle|thunderstorm/i.test(iconSrc.weather[0]?.main ?? '') : false,
      popAm,
      popPm,
      rainNote: rainNoteFor(popAm, popPm),
      configured: true,
    })
  } catch {
    return NextResponse.json({ ...EMPTY_RESULT, configured: true, error: true })
  }
}
