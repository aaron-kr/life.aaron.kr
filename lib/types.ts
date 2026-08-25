export type View = 'week' | 'month' | 'semester' | 'todo' | 'business'

export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'

export const WEEKDAYS: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

export interface WeekdayMapping {
  city: string // English/romanized — required for OpenWeatherMap's city lookup to resolve reliably
  city_kr?: string // optional Korean display label; falls back to `city` if omitted
}

export interface RecurringBlock {
  day: FullWeekday
  start: string // "HH:MM" 24h
  end: string
  type: string // maps to a b-* CSS class, e.g. "class" -> "b-class"
  title: string
  sub?: string
  color?: string // CSS var name, e.g. "--pink" — overrides the type's default palette color
  university?: string // University.abbr — shows that school's logo inline in the block
}

export interface DashboardTemplate {
  weekdays: Partial<Record<FullWeekday, WeekdayMapping>>
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
  date: string // start date, YYYY-MM-DD
  end_date?: string // optional inclusive end date — set this for multi-day events (a vacation, a conference trip) and it renders as a spanning pill instead of a single-day badge
  label: string
  type: 'family' | 'church' | 'event' | 'deadline' | 'conference' | 'ticket'
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

export interface BiblePlanEntry {
  date: string // "MM-DD", no year — reused every year indefinitely
  reading: string
}

export interface BiblePlanFile {
  plan: BiblePlanEntry[]
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
  order?: number // ascending sort within its row; unset sorts to the end
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
  order?: number // ascending sort within its group; unset sorts to the end
  university?: string // University.abbr — shows that school's logo on the card
  items: ChecklistItemDecl[]
}

export interface GoalChecklistItem {
  text: string
}

export interface GoalListFile {
  id: string
  title: string
  type: 'checklist'
  items: GoalChecklistItem[]
}

/** _data/etfs.yml — symbols to track in the sidebar's ETF row, priced live
 * from Stooq's free no-key CSV endpoint (see lib/stooq.ts). */
export interface EtfDeclaration {
  symbol: string // Stooq ticker, e.g. "VTI.US"
  label: string
  color?: string // CSS var name
}

/** _data/business-deadlines.yml — recurring KR/US filing reminders, shown in
 * the Business view. Dates are described loosely ("May 31", "Jan / Jul")
 * rather than parsed, since these are yearly-recurring reminders, not
 * calendar events. */
export interface BusinessDeadline {
  country: 'KR' | 'US'
  label: string
  when: string
  note?: string
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
  page_url?: string // the course's own webpage on courses.aaron.kr — Semester view links the title to this
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

export interface BrandingConfig {
  logoUrl: string // if set, replaces the 🧭 emoji everywhere it appears
}

export interface DashboardData {
  template: DashboardTemplate
  holidays: HolidayEntry[]
  events: PersonalEvent[]
  quotes: Quote[]
  biblePlan: BiblePlanEntry[]
  stats: StatDeclaration[]
  habits: HabitDeclaration[]
  checklists: ChecklistFile[]
  goalLists: GoalListFile[]
  tickets: TicketRoute[]
  etfs: EtfDeclaration[]
  businessDeadlines: BusinessDeadline[]
  courseSources: CourseSource[]
  courses: Course[]
  universities: University[]
  semesterStart: string | null
  hometown: HometownConfig
  branding: BrandingConfig
}
