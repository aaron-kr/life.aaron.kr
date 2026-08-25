'use client'

import type { ChecklistFile, JobsConfig, University } from '@/lib/types'
import { useAlertFeed } from '@/lib/useAlertFeed'
import { ChecklistSection } from '../Checklist/ChecklistSection'

export function JobsView({
  jobs,
  checklists,
  universities,
}: {
  jobs: JobsConfig
  checklists: ChecklistFile[]
  universities: University[]
}) {
  const { items, loading, error } = useAlertFeed(jobs.alertRssUrl)

  return (
    <section className="panel active">
      <div className="card">
        <h3>
          Jobs <span className="pill">_data/jobs.yml</span>
        </h3>
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
        <h2 className="todo-group-title">Google Alert — 강사 채용</h2>
        <div className="checklist-card" style={{ maxWidth: 560 }}>
          {!jobs.alertRssUrl && (
            <div className="ti-meta" style={{ padding: '6px 0' }}>
              Not set up yet — create an alert at google.com/alerts for &quot;강사 채용&quot; (or any other
              search), set delivery to &quot;RSS feed&quot; instead of email, and paste the feed link into
              alert_rss_url in _data/jobs.yml.
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
        <h2 className="todo-group-title">Reminders</h2>
        <div className="checklist-row">
          {checklists.map((c) => (
            <ChecklistSection checklist={c} universities={universities} key={c.id} />
          ))}
        </div>
      </div>
    </section>
  )
}
