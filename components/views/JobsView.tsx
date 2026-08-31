'use client'

import { useState } from 'react'
import type { BusinessDeadline, ChecklistFile, JobsConfig, University } from '@/lib/types'
import { useAlertFeed } from '@/lib/useAlertFeed'
import { ChecklistSection } from '../Checklist/ChecklistSection'

function DeadlineCard({ country, deadlines }: { country: string; deadlines: BusinessDeadline[] }) {
  return (
    <div className="checklist-card">
      <h4>
        <span>
          <span className="flag-emoji">{country === 'KR' ? '🇰🇷' : '🇺🇸'}</span>{' '}
          {country === 'KR' ? 'Korea' : 'United States'}
        </span>
      </h4>
      <div>
        {deadlines.map((d, i) => (
          <div className="cl-item" key={i}>
            <div className="ti-text">
              <span className="ti-route">{d.label}</span>
              <span className="ti-meta">{d.when}</span>
              {d.note && <span className="ti-meta biz-note">{d.note}</span>}
            </div>
          </div>
        ))}
        {deadlines.length === 0 && (
          <div className="ti-meta" style={{ padding: '6px 0' }}>
            None declared — add entries to _data/business-deadlines.yml.
          </div>
        )}
      </div>
    </div>
  )
}

export function JobsView({
  jobs,
  jobsChecklists,
  businessDeadlines,
  businessChecklists,
  universities,
}: {
  jobs: JobsConfig
  jobsChecklists: ChecklistFile[]
  businessDeadlines: BusinessDeadline[]
  businessChecklists: ChecklistFile[]
  universities: University[]
}) {
  const { items, loading, error } = useAlertFeed(jobs.alertRssUrl)
  const [showTax, setShowTax] = useState(false)
  const kr = businessDeadlines.filter((d) => d.country === 'KR')
  const us = businessDeadlines.filter((d) => d.country === 'US')

  return (
    <section className="panel active">
      <div className="card">
        <h3>
          Jobs &amp; Business <span className="pill">jobs.yml + business-deadlines.yml</span>
        </h3>
      </div>

      <div className="jobs-biz-split">
        <div className="jobs-biz-col col-jobs">
          <div className="card">
            {jobs.targetPositions && (
              <div className="biz-disclaimer" style={{ whiteSpace: 'pre-line' }}>
                {jobs.targetPositions.trim()}
              </div>
            )}
            {jobs.driveUrl && (
              <a className="drive-link" href={jobs.driveUrl} target="_blank" rel="noopener noreferrer">
                📁 Résumé / 경력증명서 / Corus filing — Google Drive
              </a>
            )}
          </div>

          <div className="todo-group">
            <h2 className="todo-group-title accent-jobs">Google Alert — 강사 채용</h2>
            <div className="checklist-card">
              {!jobs.alertRssUrl && (
                <div className="ti-meta" style={{ padding: '6px 0' }}>
                  Not set up yet — create an alert at google.com/alerts for &quot;강사 채용&quot; (or any
                  other search), set delivery to &quot;RSS feed&quot; instead of email, and paste the feed
                  link into alert_rss_url in _data/jobs.yml.
                </div>
              )}
              {jobs.alertRssUrl && loading && (
                <div className="ti-meta" style={{ padding: '6px 0' }}>
                  Loading…
                </div>
              )}
              {jobs.alertRssUrl && !loading && error && (
                <div className="ti-meta" style={{ padding: '6px 0' }}>
                  Couldn&apos;t load the feed — double-check the URL in _data/jobs.yml.
                </div>
              )}
              {jobs.alertRssUrl && !loading && !error && items.length === 0 && (
                <div className="ti-meta" style={{ padding: '6px 0' }}>
                  No results yet.
                </div>
              )}
              {items.map((item, i) => (
                <div className="cl-item" key={i}>
                  <div className="ti-text">
                    <a className="ti-route" href={item.link} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                    {item.pubDate && <span className="ti-meta">{item.pubDate}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="todo-group">
            <h2 className="todo-group-title accent-jobs">Reminders</h2>
            <div className="checklist-row">
              {jobsChecklists.map((c) => (
                <ChecklistSection checklist={c} universities={universities} key={c.id} />
              ))}
            </div>
          </div>
        </div>

        <div className="jobs-biz-col col-biz">
          <div className="todo-group">
            <h2 className="todo-group-title accent-biz">Milestones &amp; projects</h2>
            <div className="checklist-row">
              {businessChecklists.map((c) => (
                <ChecklistSection checklist={c} universities={universities} key={c.id} />
              ))}
              <div className="new-checklist-card">
                + new milestone checklist
                <br />
                (add a file to _data/checklists/ with group: Business)
                <br />
                (use each item&apos;s meta field for the target date)
              </div>
            </div>
          </div>

          <div className="todo-group">
            <button className="strip-collapse-btn" onClick={() => setShowTax((s) => !s)}>
              {showTax ? '▴ hide tax reference' : '▾ show KR / US tax reference'}
            </button>
            {showTax && (
              <>
                <div className="biz-disclaimer">
                  Reminder list, not tax advice — confirm dates and applicability with your 세무사 /
                  accountant.
                </div>
                <div className="checklist-row">
                  <DeadlineCard country="KR" deadlines={kr} />
                  <DeadlineCard country="US" deadlines={us} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
