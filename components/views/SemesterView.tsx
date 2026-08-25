import { Fragment } from 'react'
import Image from 'next/image'
import type { Course, CourseSource, University, Weekday } from '@/lib/types'
import { addDays, todayLocal, ymd } from '@/lib/dates'

const WEEKDAY_COLS: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

function mondayOf(dateYmd: string): Date {
  return new Date(`${dateYmd}T00:00:00`)
}

function weekIndexOf(dateYmd: string, semesterStart: Date): number {
  const d = new Date(`${dateYmd}T00:00:00`)
  return Math.floor((d.getTime() - semesterStart.getTime()) / (7 * 86400000))
}

export function SemesterView({
  courseSources,
  courses,
  semesterStart,
  universities,
}: {
  courseSources: CourseSource[]
  courses: Course[]
  semesterStart: string | null
  universities: University[]
}) {
  const sourcesWithWeekday = courseSources.filter((s) => s.weekday)
  const today = todayLocal()
  const todayYmd = ymd(today)

  if (sourcesWithWeekday.length === 0) {
    return (
      <section className="panel active">
        <div className="card">
          <h3>
            Semester <span className="pill">_data/course-sources.yml</span>
          </h3>
          <div className="sem-empty">
            No courses with a <code>weekday</code> set yet — add entries to <code>_data/course-sources.yml</code>.
            Each becomes a column here under its weekday; add a <code>url</code> once you have the lecture file to
            fill in that column&apos;s rows.
          </div>
        </div>
      </section>
    )
  }

  const lecturesFor = (source: CourseSource): Course | null => courses.find((c) => c.sourceUrl === source.url) ?? null

  // Fall back to the earliest lecture's Monday if semester_start isn't set.
  const earliestDate = courses.flatMap((c) => c.lectures.map((l) => l.date)).sort()[0]
  const startDate = semesterStart ? mondayOf(semesterStart) : earliestDate ? mondayOf(earliestDate) : today

  const byWeekday: Partial<Record<Weekday, CourseSource[]>> = {}
  sourcesWithWeekday.forEach((s) => {
    const list = byWeekday[s.weekday!] ?? (byWeekday[s.weekday!] = [])
    list.push(s)
  })

  let minWeek = 0
  let maxWeek = 0
  courses.forEach((c) => {
    c.lectures.forEach((l) => {
      const idx = weekIndexOf(l.date, startDate)
      if (idx < minWeek) minWeek = idx
      if (idx > maxWeek) maxWeek = idx
    })
  })

  const rows = Array.from({ length: maxWeek - minWeek + 1 }, (_, i) => minWeek + i)
  const todayWeekIdx = weekIndexOf(todayYmd, startDate)

  function logoFor(source: CourseSource) {
    return universities.find((u) => u.abbr === source.university)
  }

  return (
    <section className="panel active">
      <div className="card">
        <h3>
          Semester <span className="pill">_data/course-sources.yml</span>
        </h3>
        <div className="sem-wrap">
          <div className="sem-grid3">
            <div className="sem-wk-head">Wk</div>
            {WEEKDAY_COLS.map((wd) => {
              const daySources = byWeekday[wd] ?? []
              return (
                <div className="sem-day-head" key={wd}>
                  <span className="sdh-label">{wd.slice(0, 3).toUpperCase()}</span>
                  {daySources.map((s) => {
                    const uni = logoFor(s)
                    return (
                      <div className="sdh-course" key={s.url ?? s.label} style={{ ['--course-color' as string]: s.color ? `var(${s.color})` : undefined }}>
                        {uni && (
                          <a href={uni.url} target="_blank" rel="noopener noreferrer" title={`${uni.name} portal`}>
                            <Image src={uni.logo} alt={uni.name} width={16} height={16} unoptimized />
                          </a>
                        )}
                        {s.page_url ? (
                          <a href={s.page_url} target="_blank" rel="noopener noreferrer" className="sdh-course-link">
                            {s.label}
                          </a>
                        ) : (
                          <span>{s.label}</span>
                        )}
                      </div>
                    )
                  })}
                  {daySources.length === 0 && <span className="sdh-empty">—</span>}
                </div>
              )
            })}

            {rows.map((weekIdx) => {
              const rowMonday = addDays(startDate, weekIdx * 7)
              return (
                <Fragment key={weekIdx}>
                  <div className="sem-wk-cell">
                    <span>wk {weekIdx + 1}</span>
                    <span className="swc-date">{rowMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  {WEEKDAY_COLS.map((wd) => {
                    const daySources = byWeekday[wd] ?? []
                    return (
                      <div className="sem-day-cell" key={`${weekIdx}-${wd}`}>
                        {daySources.map((s) => {
                          const course = lecturesFor(s)
                          const lecture = course?.lectures.find((l) => weekIndexOf(l.date, startDate) === weekIdx)
                          if (!lecture) return null
                          const isPast = lecture.date < todayYmd
                          const isThisWeek = weekIdx === todayWeekIdx
                          return (
                            <div
                              key={s.url ?? s.label}
                              className={`sem-cell-course${isPast ? ' past' : ''}${isThisWeek ? ' current' : ''}${lecture.isBreak ? ' break-row' : ''}${lecture.isExam ? ' exam-row' : ''}`}
                              style={{ borderLeftColor: s.color ? `var(${s.color})` : 'var(--border)' }}
                            >
                              {s.page_url ? (
                                <a href={s.page_url} target="_blank" rel="noopener noreferrer">
                                  {lecture.title || '—'}
                                </a>
                              ) : (
                                lecture.title || '—'
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </Fragment>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
