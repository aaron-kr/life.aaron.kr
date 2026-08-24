export type View = 'week' | 'month' | 'semester' | 'todo'

export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'

export const WEEKDAYS: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

export interface WeekdayMapping {
  city: string
  university: string | null
}

export interface RecurringBlock {
  day: Weekday
  start: string // "HH:MM" 24h
  end: string
  type: string // maps to a b-* CSS class, e.g. "class" -> "b-class"
  title: string
  sub?: string
}

export interface DashboardTemplate {
  weekdays: Record<Weekday, WeekdayMapping>
  recurring_blocks: RecurringBlock[]
}

export interface HolidayEntry {
  date: string // YYYY-MM-DD
  label: string
  makeup?: boolean
}

export interface HolidaysFile {
  holidays: HolidayEntry[]
}

export interface PersonalEvent {
  date: string
  label: string
  type: 'hike' | 'church' | 'event' | 'deadline' | 'conference' | 'ticket'
}

export interface PersonalEventsFile {
  events: PersonalEvent[]
}

export interface Quote {
  text: string
  ref: string
}

export interface QuotesFile {
  quotes: Quote[]
}

export type StatType = 'latest' | 'total' | 'fraction'

export interface StatDeclaration {
  id: string
  label: string
  type: StatType
  unit?: string
  log: string // Firestore doc id under stat_logs/
  reset_date?: string // for type: total
  goal?: number // for type: fraction
  color?: string
  sidebar?: 'body' | 'semester' // which sidebar section this renders in
}

export interface StatsFile {
  stats: StatDeclaration[]
}

export interface HabitDeclaration {
  id: string
  label: string
  color: string // CSS var name, e.g. "--pink"
  log: string // Firestore doc id under habit_checkins/
}

export interface HabitsFile {
  habits: HabitDeclaration[]
}

export interface ChecklistItemDecl {
  text: string
  meta?: string
  urgent?: boolean
}

export interface ChecklistFile {
  id: string // derived from filename
  title: string
  items: ChecklistItemDecl[]
}

export interface GoalChecklistItem {
  text: string
}

export interface GoalTickerItem {
  sym: string
  price: string
  chg: string
  up: boolean
}

export interface GoalListFile {
  id: string
  title: string
  type: 'checklist' | 'ticker'
  items: GoalChecklistItem[] | GoalTickerItem[]
}

export interface TicketRoute {
  id: string
  weekday: Weekday
  route: string
  short: string
  opens_before_days: number // ticket sales open this many days before the trip
  note?: string
  urgent_within_days?: number
}

export interface TicketsFile {
  routes: TicketRoute[]
}

export type FullWeekday = Weekday | 'saturday' | 'sunday'

/** One course's raw source: a flat lecture-list YAML like courses.aaron.kr
 * uses (`_data/<year>/<slug>_lectures.yml`) — see lib/courses.ts for the
 * expected per-entry shape (date/week/title/logistics). */
export interface CourseSource {
  label: string
  url: string
  color?: string // CSS var name, e.g. "--blue"
}

export interface CourseSourcesFile {
  sources: CourseSource[]
}

export interface CourseLecture {
  date: string // resolved YYYY-MM-DD
  week: number
  title: string // sanitized plain text (source titles may contain HTML)
  logistics?: string
  weekday: FullWeekday
  isBreak: boolean // e.g. "No Class — holiday"
  isExam: boolean // e.g. "Midterm Test"
}

export interface Course {
  label: string
  color?: string
  sourceUrl: string
  lectures: CourseLecture[]
}

export interface DashboardData {
  template: DashboardTemplate
  holidays: HolidayEntry[]
  events: PersonalEvent[]
  quotes: Quote[]
  stats: StatDeclaration[]
  habits: HabitDeclaration[]
  checklists: ChecklistFile[]
  goalLists: GoalListFile[]
  tickets: TicketRoute[]
  courses: Course[]
}
