import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { fetchAllCourses } from './courses'
import type {
  ChecklistFile,
  CourseSourcesFile,
  DashboardData,
  DashboardTemplate,
  GoalListFile,
  HabitsFile,
  HolidaysFile,
  PersonalEventsFile,
  QuotesFile,
  StatsFile,
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

export async function loadDashboardData(): Promise<DashboardData> {
  const template = readYaml<DashboardTemplate>('dashboard-template.yml', {
    weekdays: {
      monday: { city: '', university: null },
      tuesday: { city: '', university: null },
      wednesday: { city: '', university: null },
      thursday: { city: '', university: null },
      friday: { city: '', university: null },
    },
    recurring_blocks: [],
  })

  const holidays = readYaml<HolidaysFile>('holidays.yml', { holidays: [] }).holidays
  const events = readYaml<PersonalEventsFile>('personal-events.yml', { events: [] }).events
  const quotes = readYaml<QuotesFile>('quotes.yml', { quotes: [] }).quotes
  const stats = readYaml<StatsFile>('stats.yml', { stats: [] }).stats
  const habits = readYaml<HabitsFile>('habits.yml', { habits: [] }).habits
  const tickets = readYaml<TicketsFile>('tickets.yml', { routes: [] }).routes

  const checklists: ChecklistFile[] = readYamlDir<Omit<ChecklistFile, 'id'>>('checklists').map(
    ({ id, data }) => ({ id, ...data })
  )
  const goalLists: GoalListFile[] = readYamlDir<Omit<GoalListFile, 'id'>>('goal-lists').map(
    ({ id, data }) => ({ id, ...data })
  )

  const courseSources = readYaml<CourseSourcesFile>('course-sources.yml', { sources: [] }).sources
  const courses = await fetchAllCourses(courseSources)

  return { template, holidays, events, quotes, stats, habits, checklists, goalLists, tickets, courses }
}
