import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { fetchAllCourses } from './courses'
import { fetchUniversities } from './universities'
import type {
  BiblePlanFile,
  BrandingConfig,
  BusinessDeadline,
  ChecklistFile,
  CourseSourcesFile,
  DashboardData,
  DashboardTemplate,
  EtfDeclaration,
  GoalListFile,
  HabitsFile,
  HolidaysFile,
  HometownConfig,
  JobsConfig,
  PersonalEventsFile,
  QuotesFile,
  StatDeclaration,
  TicketsFile,
  WeatherCitiesFile,
} from './types'

const DATA_DIR = path.join(process.cwd(), '_data')

function readYaml<T>(relPath: string, fallback: T): T {
  const full = path.join(DATA_DIR, relPath)
  if (!fs.existsSync(full)) return fallback
  const raw = fs.readFileSync(full, 'utf8')
  return (yaml.load(raw) as T) ?? fallback
}

function readYamlDir<T>(relDir: string): { id: string; data: T }[] {
  const full = path.join(DATA_DIR, relDir)
  if (!fs.existsSync(full)) return []
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .map((f) => ({
      id: f.replace(/\.ya?ml$/, ''),
      data: yaml.load(fs.readFileSync(path.join(full, f), 'utf8')) as T,
    }))
}

/** Sorts ascending by an optional `order` field — items without one sort
 * after all items that have one, in their original (directory-read) order. */
function sortByOrder<T extends { order?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
}

export async function loadDashboardData(): Promise<DashboardData> {
  const template = readYaml<DashboardTemplate>('weekly.yml', { recurring_blocks: [] })
  const weatherCities = readYaml<WeatherCitiesFile>('weather.yml', {
    weekdays: {
      monday: { city: '' },
      tuesday: { city: '' },
      wednesday: { city: '' },
      thursday: { city: '' },
      friday: { city: '' },
    },
  }).weekdays

  const holidays = readYaml<HolidaysFile>('holidays.yml', { holidays: [] }).holidays
  const events = readYaml<PersonalEventsFile>('personal-events.yml', { events: [] }).events
  const quotes = readYaml<QuotesFile>('quotes.yml', { quotes: [] }).quotes
  const biblePlan = readYaml<BiblePlanFile>('bible-plan.yml', { plan: [] }).plan
  const habits = readYaml<HabitsFile>('habits.yml', { habits: [] }).habits
  const tickets = readYaml<TicketsFile>('tickets.yml', { routes: [] }).routes
  const etfs = readYaml<{ etfs: EtfDeclaration[] }>('etfs.yml', { etfs: [] }).etfs
  const businessDeadlines = readYaml<{ deadlines: BusinessDeadline[] }>('business-deadlines.yml', {
    deadlines: [],
  }).deadlines

  const stats: StatDeclaration[] = sortByOrder(
    readYamlDir<Omit<StatDeclaration, 'id'>>('stats').map(({ id, data }) => ({ id, ...data }))
  )
  const checklists: ChecklistFile[] = sortByOrder(
    readYamlDir<Omit<ChecklistFile, 'id'>>('checklists').map(({ id, data }) => ({ id, ...data }))
  )
  const goalLists: GoalListFile[] = readYamlDir<Omit<GoalListFile, 'id'>>('goal-lists').map(({ id, data }) => ({
    id,
    ...data,
  }))

  const courseSourcesFile = readYaml<CourseSourcesFile>('course-sources.yml', { sources: [] })
  const courseSources = courseSourcesFile.sources
  const semesterStart = courseSourcesFile.semester_start ?? null

  const hometown = readYaml<HometownConfig>('hometown.yml', {
    city: '',
    country: 'US',
    timezone: 'America/Denver',
    label: 'Home',
  })

  const brandingRaw = readYaml<{ logo_url?: string }>('branding.yml', {})
  const branding: BrandingConfig = { logoUrl: brandingRaw.logo_url ?? '' }

  const jobsRaw = readYaml<{ alert_rss_url?: string; drive_url?: string; target_positions?: string }>('jobs.yml', {})
  const jobs: JobsConfig = {
    alertRssUrl: jobsRaw.alert_rss_url ?? '',
    driveUrl: jobsRaw.drive_url ?? '',
    targetPositions: jobsRaw.target_positions ?? '',
  }

  const [courses, universities] = await Promise.all([fetchAllCourses(courseSources), fetchUniversities()])

  return {
    template,
    weatherCities,
    holidays,
    events,
    quotes,
    biblePlan,
    stats,
    habits,
    checklists,
    goalLists,
    tickets,
    etfs,
    businessDeadlines,
    courseSources,
    courses,
    universities,
    semesterStart,
    hometown,
    branding,
    jobs,
  }
}
