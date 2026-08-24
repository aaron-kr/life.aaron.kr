import type { CourseSource, University, Weekday } from './types'

/** Built from the *declared* course-sources.yml entries (not the fetched
 * lecture data) so a school's logo shows up in the Month view / weather hero
 * as soon as you set its weekday+university — no lecture URL required yet. */
export function buildWeekdayUniversities(
  sources: CourseSource[],
  universities: University[]
): Partial<Record<Weekday, University[]>> {
  const map: Partial<Record<Weekday, University[]>> = {}
  for (const source of sources) {
    if (!source.weekday || !source.university) continue
    const uni = universities.find((u) => u.abbr === source.university)
    if (!uni) continue
    const list = map[source.weekday] ?? (map[source.weekday] = [])
    if (!list.some((u) => u.abbr === uni.abbr)) list.push(uni)
  }
  return map
}
