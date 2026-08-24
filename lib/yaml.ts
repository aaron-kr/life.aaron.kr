import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { fetchAllCourses } from './courses'
import { fetchUniversities } from './universities'
import type {
  ChecklistFile,
  CourseSourcesFile,
  DashboardData,
  DashboardTemplate,
  GoalListFile,
  HabitsFile,
  HolidaysFile,
  HometownConfig,
  PersonalEventsFile,
  QuotesFile,
  StatDeclaration,
  TicketsFile,
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
  const template = readYaml<DashboardTemplate>('weekly.yml', {
    weekdays: {
      monday: { city: '' },
      tuesday: { city: '' },
      wednesday: { city: '' },
      thursday: { city: '' },
      friday: { city: '' },
    },
    recurring_blocks: [],
  })

  const holidays = readYaml<HolidaysFile>('holidays.yml', { holidays: [] }).holidays
  const events = readYaml<PersonalEventsFile>('personal-events.yml', { events: [] }).events
  const quotes = readYaml<QuotesFile>('quotes.yml', { quotes: [] }).quotes
  const habits = readYaml<HabitsFile>('habits.yml', { habits: [] }).habits
  const tickets = readYaml<TicketsFile>('tickets.yml', { routes: [] }).routes

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

  const [courses, universities] = await Promise.all([fetchAllCourses(courseSources), fetchUniversities()])

  return {
    template,
    holidays,
    events,
    quotes,
    stats,
    habits,
    checklists,
    goalLists,
    tickets,
    courseSources,
    courses,
    universities,
    semesterStart,
    hometown,
  }
}
