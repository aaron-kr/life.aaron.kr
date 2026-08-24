import { WEEKDAY_ORDER, addDays, mondayOfWeek, sameDate, todayLocal, ymd } from './dates'
import type { DashboardTemplate, Weekday } from './types'

export interface WeekDayInfo {
  weekday: Weekday
  date: Date
  dateYmd: string
  city: string
  university: string | null
  isToday: boolean
  label: string // MON, TUE, ...
}

export function getThisWeekDays(template: DashboardTemplate): WeekDayInfo[] {
  const today = todayLocal()
  const monday = mondayOfWeek(today)
  return WEEKDAY_ORDER.map((weekday, i) => {
    const date = addDays(monday, i)
    const mapping = template.weekdays[weekday] ?? { city: '', university: null }
    return {
      weekday,
      date,
      dateYmd: ymd(date),
      city: mapping.city,
      university: mapping.university,
      isToday: sameDate(date, today),
      label: weekday.slice(0, 3).toUpperCase(),
    }
  })
}
