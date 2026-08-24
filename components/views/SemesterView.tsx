import type { Course } from '@/lib/types'
import { currentWeekRange, todayLocal } from '@/lib/dates'

export function SemesterView({ courses }: { courses: Course[] }) {
  const [weekStart, weekEnd] = currentWeekRange(todayLocal())

  return (
    <section className="panel active">
      <div className="card">
        <h3>
          Semester <span className="pill">_data/course-sources.yml</span>
        </h3>
        {courses.length === 0 ? (
          <div className="sem-empty">
            No courses configured yet — add one to <code>_data/course-sources.yml</code> with a raw GitHub link to
            that course&apos;s lecture YAML.
            <br />
            Any number of courses works; each becomes its own column here.
          </div>
        ) : (
          <div className="sem-wrap">
            <div className="sem-courses">
              {courses.map((course) => (
                <div className="sem-course-col" key={course.sourceUrl} style={{ ['--course-color' as string]: course.color ? `var(${course.color})` : undefined }}>
                  <div className="sem-course-head">
                    <span className="sc-title">{course.label}</span>
                    <span className="sc-count">{course.lectures.length} sessions</span>
                  </div>
                  <div className="sem-lecture-list">
                    {course.lectures.length === 0 ? (
                      <div className="sem-course-empty">No lectures parsed from this file yet.</div>
                    ) : (
                      course.lectures.map((lec) => {
                        const isThisWeek = lec.date >= weekStart && lec.date <= weekEnd
                        return (
                          <div
                            key={lec.date}
                            className={`sem-lecture-row${isThisWeek ? ' today-week' : ''}${lec.isBreak ? ' break-row' : ''}${lec.isExam ? ' exam-row' : ''}`}
                          >
                            <div className="sem-lecture-wk">
                              wk {lec.week}
                              <span className="sl-date">
                                {new Date(`${lec.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <div className="sem-lecture-body">
                              <div className="sem-lecture-title">{lec.title || '—'}</div>
                              {lec.logistics && <div className="sem-lecture-meta">{lec.logistics}</div>}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
