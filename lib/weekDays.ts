import { FULL_WEEK_ORDER, WEEKDAY_ORDER, addDays, nextWeekdayOccurrence, sameDate, sundayOfWeek, todayLocal, ymd } from './dates'
import type { FullWeekday, Weekday, WeekdayMapping } from './types'

type WeatherCities = Partial<Record<FullWeekday, WeekdayMapping>>

export interface WeekDayInfo {
  weekday: Weekday
  date: Date
  dateYmd: string
  city: string // English/romanized — used for the weather API lookup
  cityDisplay: string // city_kr if set, else city — used for on-screen labels
  isToday: boolean
  label: string // MON, TUE, ...
}

/** Rolling, not calendar-week-anchored: each weekday is its *next* occurrence
 * on/after today (today itself if today is that weekday), so no slot ever
 * points at a day that's already passed — the forecast API only has data
 * for today forward anyway, so a fixed Mon-anchored week would show blank
 * "—" cells for any weekday already behind us once the week is underway. */
export function getThisWeekDays(weatherCities: WeatherCities): WeekDayInfo[] {
  const today = todayLocal()
  return WEEKDAY_ORDER.map((weekday) => {
    const date = nextWeekdayOccurrence(today, weekday)
    const mapping = weatherCities[weekday] ?? { city: '' }
    return {
      weekday,
      date,
      dateYmd: ymd(date),
      city: mapping.city,
      cityDisplay: mapping.city_kr || mapping.city,
      isToday: sameDate(date, today),
      label: weekday.slice(0, 3).toUpperCase(),
    }
  })
}

export interface WeekendDayInfo {
  weekday: 'saturday' | 'sunday'
  date: Date
  dateYmd: string
  city: string
  cityDisplay: string
  isToday: boolean
}

/** Same rolling logic as getThisWeekDays, for the sidebar's combined Sat/Sun box. */
export function getWeekendDays(weatherCities: WeatherCities): [WeekendDayInfo, WeekendDayInfo] {
  const today = todayLocal()
  return (['saturday', 'sunday'] as const).map((weekday) => {
    const date = nextWeekdayOccurrence(today, weekday)
    const mapping = weatherCities[weekday] ?? { city: '' }
    return {
      weekday,
      date,
      dateYmd: ymd(date),
      city: mapping.city,
      cityDisplay: mapping.city_kr || mapping.city,
      isToday: sameDate(date, today),
    }
  }) as [WeekendDayInfo, WeekendDayInfo]
}

export interface FullWeekDayInfo {
  weekday: FullWeekday
  date: Date
  dateYmd: string
  city: string
  cityDisplay: string
  isToday: boolean
  label: string
}

/** Sunday -> Saturday, for the Week view grid. */
export function getThisFullWeekDays(weatherCities: WeatherCities): FullWeekDayInfo[] {
  const today = todayLocal()
  const sunday = sundayOfWeek(today)
  return FULL_WEEK_ORDER.map((weekday, i) => {
    const date = addDays(sunday, i)
    const mapping = weatherCities[weekday] ?? { city: '' }
    return {
      weekday,
      date,
      dateYmd: ymd(date),
      city: mapping.city,
      cityDisplay: mapping.city_kr || mapping.city,
      isToday: sameDate(date, today),
      label: weekday.slice(0, 3).toUpperCase(),
    }
  })
}
