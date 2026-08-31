import yaml from 'js-yaml'
import type { Course, CourseLecture, CourseSource, FullWeekday } from './types'

interface RawLectureEntry {
  date?: string // "M/D", no year — the year comes from the source URL's /YYYY/ folder
  week?: number
  title?: string
  logistics?: string
}

const WEEKDAY_NAMES: FullWeekday[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

/** Strips the HTML these lecture files sometimes use for styling (<strong>,
 * <br>, <span style>, hidden <div>s for not-yet-public content) down to
 * plain text for a compact schedule cell. */
function sanitizeTitle(html: string | undefined | null): string {
  if (!html) return ''
  let s = html
  s = s.replace(/<div[^>]*display:\s*none[^>]*>[\s\S]*?<\/div>/gi, '') // drop hidden blocks entirely
  s = s.replace(/<br\s*\/?>/gi, ' / ')
  s = s.replace(/<[^>]+>/g, '')
  s = s.replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
  return s.replace(/\s+/g, ' ').trim()
}

/** "9/3" + a source URL containing "/2026/" -> "2026-09-03". */
function resolveDate(dateStr: string | undefined, sourceUrl: string): string | null {
  if (!dateStr) return null
  const m = dateStr.trim().match(/^(\d{1,2})\/(\d{1,2})$/)
  if (!m) return null
  const yearMatch = sourceUrl.match(/\/(\d{4})\//)
  const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear()
  const month = String(parseInt(m[1], 10)).padStart(2, '0')
  const day = String(parseInt(m[2], 10)).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export async function fetchCourse(source: CourseSource): Promise<Course | null> {
  if (!source.url) return null
  try {
    // Short revalidate window on purpose — this is actively-edited class
    // content (syllabus tweaks, added lectures), and Next's fetch cache
    // persists across deployments by URL, so a `git push` alone doesn't
    // bust it. A full hour of staleness reads as "my edit didn't save."
    const res = await fetch(source.url, { next: { revalidate: 300 } })
    if (!res.ok) return null
    const text = await res.text()
    const raw = yaml.load(text) as RawLectureEntry[]
    if (!Array.isArray(raw)) return null

    const lectures: CourseLecture[] = raw
      .map((entry): CourseLecture | null => {
        const date = resolveDate(entry.date, source.url!)
        if (!date) return null
        const title = sanitizeTitle(entry.title)
        const weekday = WEEKDAY_NAMES[new Date(`${date}T00:00:00`).getDay()]
        return {
          date,
          week: entry.week ?? 0,
          title,
          logistics: sanitizeTitle(entry.logistics) || undefined,
          weekday,
          isBreak: /no class/i.test(title),
          isExam: /midterm|final/i.test(title) && /test|exam|quiz/i.test(title),
        }
      })
      .filter((l): l is CourseLecture => l !== null)
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      label: source.label,
      color: source.color,
      university: source.university,
      weekday: source.weekday,
      sourceUrl: source.url,
      lectures,
    }
  } catch {
    return null
  }
}

export async function fetchAllCourses(sources: CourseSource[]): Promise<Course[]> {
  const results = await Promise.all(sources.map(fetchCourse))
  return results.filter((c): c is Course => c !== null)
}
