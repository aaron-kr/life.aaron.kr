import { Fragment } from 'react'
import type { ClassSchedule } from '@/lib/types'

export function SemesterView({ classSchedule }: { classSchedule: ClassSchedule | null }) {
  return (
    <section className="panel active">
      <div className="card">
        <h3>
          Semester <span className="pill">courses.aaron.kr / _data/class-schedule.yml</span>
        </h3>
        {!classSchedule ? (
          <div className="sem-empty">
            class-schedule.yml isn&apos;t available yet at CLASS_SCHEDULE_URL.
            <br />
            Once it exists in the courses.aaron.kr repo (with <code>days</code> and <code>week</code> keys), this
            view fills in automatically — nothing to change here.
          </div>
        ) : (
          <div className="sem-wrap">
            <div className="sem-grid2">
              <div className="weeklabel">Wk</div>
              {classSchedule.days.map((d) => (
                <div className="shead2" key={d.weekday}>
                  {d.logo && (
                    <span className="slogo" title={d.university}>
                      {d.logo}
                    </span>
                  )}
                  <div className="stxt">
                    <span className="sday">{d.weekday.slice(0, 3).toUpperCase()}</span>
                    <span className="suniv">{d.university}</span>
                  </div>
                </div>
              ))}
              <div className="shead2">
                <div className="stxt">
                  <span className="sday">Deadlines</span>
                  <span className="suniv">/ 학회</span>
                </div>
              </div>

              {classSchedule.weeks.map((w) => (
                <Fragment key={w.week}>
                  <div className="weeklabel">{w.week}</div>
                  {classSchedule.days.map((d) => (
                    <div className="scell2" key={`${w.week}-${d.weekday}`}>
                      {w.break ? (
                        <div className="sc-break">exam / break week</div>
                      ) : (
                        <div
                          className="sc-half"
                          style={{ background: d.color ? `${d.color}22` : 'var(--panel-2)', borderLeft: `3px solid ${d.color ?? 'var(--border)'}` }}
                        >
                          {w.title}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="dl-cell">
                    {classSchedule.deadlines?.[w.week] && (
                      <span className="dl-tag" style={{ background: 'var(--pink-dim)', color: 'var(--pink)' }} title={classSchedule.deadlines[w.week].text}>
                        deadline
                      </span>
                    )}
                    {classSchedule.conferences?.[w.week] && (
                      <span className="dl-tag" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }} title={classSchedule.conferences[w.week].text}>
                        학회
                      </span>
                    )}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
