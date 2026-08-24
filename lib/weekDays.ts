import { FULL_WEEK_ORDER, WEEKDAY_ORDER, addDays, mondayOfWeek, sameDate, sundayOfWeek, todayLocal, ymd } from './dates'
import type { DashboardTemplate, FullWeekday, Weekday } from './types'

export interface WeekDayInfo {
  weekday: Weekday
  date: Date
  dateYmd: string
  city: string // English/romanized — used for the weather API lookup
  cityDisplay: string // city_kr if set, else city — used for on-screen labels
  isToday: boolean
  label: string // MON, TUE, ...
}

export function getThisWeekDays(template: DashboardTemplate): WeekDayInfo[] {
  const today = todayLocal()
  const monday = mondayOfWeek(today)
  return WEEKDAY_ORDER.map((weekday, i) => {
    const date = addDays(monday, i)
    const mapping = template.weekdays[weekday] ?? { city: '' }
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
export function getThisFullWeekDays(template: DashboardTemplate): FullWeekDayInfo[] {
  const today = todayLocal()
  const sunday = sundayOfWeek(today)
  return FULL_WEEK_ORDER.map((weekday, i) => {
    const date = addDays(sunday, i)
    const mapping = template.weekdays[weekday] ?? { city: '' }
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
