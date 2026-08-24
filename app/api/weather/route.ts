import { NextRequest, NextResponse } from 'next/server'

interface ForecastEntry {
  dt_txt: string // "2026-08-24 09:00:00"
  main: { temp: number }
  weather: { icon: string; main: string }[]
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

function closestTo(entries: ForecastEntry[], dateYmd: string, targetHour: number): ForecastEntry | null {
  const sameDay = entries.filter((e) => e.dt_txt.startsWith(dateYmd))
  if (!sameDay.length) return null
  return sameDay.reduce((best, e) => {
    const hour = parseInt(e.dt_txt.slice(11, 13), 10)
    const bestHour = parseInt(best.dt_txt.slice(11, 13), 10)
    return Math.abs(hour - targetHour) < Math.abs(bestHour - targetHour) ? e : best
  }, sameDay[0])
}

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city')
  const date = req.nextUrl.searchParams.get('date') // YYYY-MM-DD, defaults to today
  const apiKey = process.env.OPENWEATHER_API_KEY

  if (!city) return NextResponse.json({ error: 'city is required' }, { status: 400 })
  if (!apiKey) {
    return NextResponse.json({ am: null, pm: null, icon: null, rain: false, configured: false })
  }

  const dateYmd = date ?? new Date().toISOString().slice(0, 10)

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
      city
    )},KR&units=metric&appid=${apiKey}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`OpenWeather ${res.status}`)
    const data = (await res.json()) as { list: ForecastEntry[] }

    const am = closestTo(data.list, dateYmd, 9)
    const pm = closestTo(data.list, dateYmd, 15)
    const iconSrc = pm ?? am

    return NextResponse.json({
      am: am ? Math.round(am.main.temp) : null,
      pm: pm ? Math.round(pm.main.temp) : null,
      icon: iconSrc ? iconEmoji(iconSrc.weather[0]?.icon ?? '01d') : null,
      rain: iconSrc ? /rain|drizzle|thunderstorm/i.test(iconSrc.weather[0]?.main ?? '') : false,
      configured: true,
    })
  } catch {
    return NextResponse.json({ am: null, pm: null, icon: null, rain: false, configured: true, error: true })
  }
}
