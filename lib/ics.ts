import type { CalendarSource, ImportedEvent } from './types'

// A deliberately small RFC5545 subset — enough for the real cases this app
// needs (holiday calendars, a sports schedule, a Google Calendar teaching
// calendar with a simple weekly recurring meeting), not a general-purpose
// ICS library. See expandRRule() below for exactly what's supported.

function unescapeIcsText(s: string): string {
  return s
    .replace(/\\n/gi, ' ')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
}

/** RFC5545 line "folding": a line starting with a space/tab continues the
 * previous line. Long SUMMARY/DESCRIPTION values are routinely wrapped this
 * way — without unfolding, they'd parse as garbage fragment lines. */
function unfoldLines(text: string): string[] {
  const rawLines = text.split(/\r\n|\n|\r/)
  const lines: string[] = []
  for (const line of rawLines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1)
    } else {
      lines.push(line)
    }
  }
  return lines
}

/** "20260905" (all-day) or "20260905T090000Z" (timed) -> "2026-09-05" — the
 * Month view only cares which day an event falls on, never the time. */
function parseIcsDate(raw: string): string | null {
  const m = raw.trim().match(/^(\d{4})(\d{2})(\d{2})(T\d{6}Z?)?$/)
  if (!m) return null
  return `${m[1]}-${m[2]}-${m[3]}`
}

function addDaysToYmd(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Expands FREQ=DAILY/WEEKLY (with INTERVAL and COUNT or UNTIL) into
 * individual dates, recurring on DTSTART's own weekday. Anything with
 * BYDAY/BYMONTH/monthly/yearly patterns — genuinely more complex recurrence
 * math this isn't worth hand-rolling — falls back to a single occurrence at
 * DTSTART rather than silently guessing wrong. Hard-capped at 730
 * occurrences / 3 years out either way, so a malformed or unbounded rule
 * can't hang the build. */
function expandRRule(dtstart: string, rrule: string, exdates: Set<string>): string[] {
  const parts: Record<string, string> = {}
  rrule.split(';').forEach((p) => {
    const [k, v] = p.split('=')
    if (k && v) parts[k.toUpperCase()] = v
  })

  const freq = parts.FREQ
  if ((freq !== 'DAILY' && freq !== 'WEEKLY') || parts.BYDAY) {
    return exdates.has(dtstart) ? [] : [dtstart]
  }

  const interval = Math.max(1, parseInt(parts.INTERVAL ?? '1', 10) || 1)
  const count = parts.COUNT ? parseInt(parts.COUNT, 10) : null
  const until = parts.UNTIL ? parseIcsDate(parts.UNTIL) : null
  const stepDays = freq === 'DAILY' ? interval : interval * 7
  const MAX_OCCURRENCES = 730
  const hardStop = addDaysToYmd(dtstart, 366 * 3)

  const dates: string[] = []
  let cursor = dtstart
  let iterations = 0
  while (iterations < MAX_OCCURRENCES && cursor <= hardStop) {
    if (until != null && cursor > until) break
    if (!exdates.has(cursor)) dates.push(cursor)
    iterations++
    if (count != null && iterations >= count) break
    cursor = addDaysToYmd(cursor, stepDays)
  }
  return dates
}

function parseIcs(text: string, source: CalendarSource): ImportedEvent[] {
  const lines = unfoldLines(text)
  const events: ImportedEvent[] = []

  let inEvent = false
  let summary = ''
  let dtstart: string | null = null
  let rrule: string | null = null
  let exdates: string[] = []

  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true
      summary = ''
      dtstart = null
      rrule = null
      exdates = []
      continue
    }
    if (line.startsWith('END:VEVENT')) {
      inEvent = false
      if (dtstart) {
        const exSet = new Set(exdates)
        const dates = rrule ? expandRRule(dtstart, rrule, exSet) : exSet.has(dtstart) ? [] : [dtstart]
        dates.forEach((date) =>
          events.push({ date, label: summary || '(untitled)', calendarId: source.id, calendarLabel: source.label, color: source.color })
        )
      }
      continue
    }
    if (!inEvent) continue

    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const rawKey = line.slice(0, colonIdx)
    const value = line.slice(colonIdx + 1)
    const key = rawKey.split(';')[0].toUpperCase()

    if (key === 'SUMMARY') {
      summary = unescapeIcsText(value)
    } else if (key === 'DTSTART') {
      const parsed = parseIcsDate(value)
      if (parsed) dtstart = parsed
    } else if (key === 'RRULE') {
      rrule = value
    } else if (key === 'EXDATE') {
      value.split(',').forEach((v) => {
        const parsed = parseIcsDate(v)
        if (parsed) exdates.push(parsed)
      })
    }
  }

  return events
}

export async function fetchCalendar(source: CalendarSource): Promise<ImportedEvent[]> {
  if (!source.url) return []
  try {
    // Actively-used feeds (a Google Calendar you're still adding to) — same
    // short window as course lecture files, for the same reason: don't make
    // an edit feel like it silently didn't take for up to an hour.
    const res = await fetch(source.url, { next: { revalidate: 600 } })
    if (!res.ok) return []
    const text = await res.text()
    return parseIcs(text, source)
  } catch {
    return []
  }
}

export async function fetchAllCalendars(sources: CalendarSource[]): Promise<ImportedEvent[]> {
  const results = await Promise.all(sources.map(fetchCalendar))
  return results.flat()
}
