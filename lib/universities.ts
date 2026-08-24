import yaml from 'js-yaml'
import type { University } from './types'

// courses.aaron.kr's shared university directory. Change this if that repo's
// path ever moves — it's the one thing here that isn't per-course YAML.
const UNIVERSITIES_URL =
  'https://raw.githubusercontent.com/aaronkr-courses/courses.aaron.kr/refs/heads/main/_data/universities.yml'

interface RawUniversity {
  name?: string
  name_ko?: string
  short_ko?: string
  abbr?: string
  url?: string
  logo?: string
}

export async function fetchUniversities(): Promise<University[]> {
  try {
    const res = await fetch(UNIVERSITIES_URL, { next: { revalidate: 86400 } })
    if (!res.ok) return []
    const raw = yaml.load(await res.text()) as RawUniversity[]
    if (!Array.isArray(raw)) return []
    const universities: University[] = []
    for (const u of raw) {
      if (u.abbr && u.name && u.url && u.logo) {
        universities.push({ abbr: u.abbr, name: u.name, nameKo: u.name_ko, shortKo: u.short_ko, url: u.url, logo: u.logo })
      }
    }
    return universities
  } catch {
    return []
  }
}
