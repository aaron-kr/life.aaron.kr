export type View = 'week' | 'month' | 'semester' | 'todo'

export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'

export const WEEKDAYS: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

export interface WeekdayMapping {
  city: string // English/romanized — required for OpenWeatherMap's city lookup to resolve reliably
  city_kr?: string // optional Korean display label; falls back to `city` if omitted
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
  id: string // derived from filename, e.g. _data/stats/weight.yml -> "weight"
  label: string
  type: StatType
  unit?: string
  log: string // Firestore doc id under stat_logs/
  reset_date?: string // for type: total
  goal?: number // for type: fraction
  color?: string
  placement: 'body' | 'semester' // which row of the top stats strip this renders in
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
  group?: string // optional row heading — files sharing a group render together, e.g. "Schools"
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

/** courses.aaron.kr's shared university directory — fetched once, matched to
 * course-sources.yml entries by `abbr`. */
export interface University {
  abbr: string // key, e.g. "cbnu"
  name: string
  nameKo?: string
  shortKo?: string
  url: string // portal URL
  logo: string
}

/** One course's raw source: a flat lecture-list YAML like courses.aaron.kr
 * uses (`_data/<year>/<slug>_lectures.yml`) — see lib/courses.ts for the
 * expected per-entry shape (date/week/title/logistics). `weekday` and
 * `university` are declared explicitly here (not inferred from lecture
 * dates) since they drive placement in the Semester/Month views and the
 * weather hero's school logo even before a lecture file is wired up. */
export interface CourseSource {
  label: string
  url?: string // optional — omit while you haven't added the lecture file yet
  color?: string // CSS var name, e.g. "--blue"
  university?: string // University.abbr
  weekday?: Weekday
}

export interface CourseSourcesFile {
  semester_start?: string // YYYY-MM-DD Monday that begins "week 1" in the Semester view
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
  university?: string
  weekday?: Weekday
  sourceUrl?: string
  lectures: CourseLecture[]
}

export interface HometownConfig {
  city: string
  state?: string // 2-letter US state code, improves weather match accuracy
  country: string // ISO 3166-1 alpha-2, e.g. "US"
  timezone: string // IANA name, e.g. "America/Denver"
  label: string
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
  courseSources: CourseSource[]
  courses: Course[]
  universities: University[]
  semesterStart: string | null
  hometown: HometownConfig
}
