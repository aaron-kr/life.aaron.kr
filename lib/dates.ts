import type { Weekday } from './types'

export const WEEKDAY_ORDER: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

export function todayLocal(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function ymd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function sameDate(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d)
  out.setDate(out.getDate() + n)
  return out
}

// JS getDay(): 0=Sun..6=Sat. Our week runs Mon..Fri for the schedule grid.
const DOW_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export function weekdayKey(d: Date): string {
  return DOW_KEYS[d.getDay()]
}

export function mondayOfWeek(d: Date): Date {
  const dow = d.getDay() // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow
  return addDays(d, diff)
}

export function sundayOfWeek(d: Date): Date {
  const dow = d.getDay()
  return addDays(d, -dow)
}

/** 42-day rolling grid: 2 weeks before the current week's Sunday, 3 weeks after. */
export function rollingMonthGridStart(today: Date): Date {
  return addDays(sundayOfWeek(today), -14)
}

export function fmtHourLabel(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':')
  let h = parseInt(hStr, 10)
  const period = h >= 12 ? 'p' : 'a'
  h = h % 12
  if (h === 0) h = 12
  return mStr === '00' ? `${h}${period}` : `${h}:${mStr}${period}`
}

export function minutesSinceMidnight(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((s) => parseInt(s, 10))
  return h * 60 + m
}

/** Rolling ticket window: today -> today+28d, bucketed into 3 groups. */
export function ticketWindowBucket(tripDate: Date, today: Date): 'this' | 'next' | 'later' | null {
  const diffDays = Math.round((tripDate.getTime() - today.getTime()) / 86400000)
  if (diffDays < 0 || diffDays > 28) return null
  if (diffDays <= 7) return 'this'
  if (diffDays <= 14) return 'next'
  return 'later'
}

/** Next occurrence of a given weekday on/after `from`. */
export function nextWeekdayOccurrence(from: Date, weekday: Weekday): Date {
  const targetDow = WEEKDAY_ORDER.indexOf(weekday) + 1 // Mon=1..Fri=5
  let d = new Date(from)
  for (let i = 0; i < 14; i++) {
    if (d.getDay() === targetDow) return d
    d = addDays(d, 1)
  }
  return from
}
