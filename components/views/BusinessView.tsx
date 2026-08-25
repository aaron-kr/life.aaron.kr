'use client'

import { useState } from 'react'
import type { BusinessDeadline, ChecklistFile, University } from '@/lib/types'
import { ChecklistSection } from '../Checklist/ChecklistSection'

function DeadlineCard({ country, deadlines }: { country: string; deadlines: BusinessDeadline[] }) {
  return (
    <div className="checklist-card">
      <h4 className="flag-emoji">{country === 'KR' ? '🇰🇷 Korea' : '🇺🇸 United States'}</h4>
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

export function BusinessView({
  deadlines,
  checklists,
  universities,
}: {
  deadlines: BusinessDeadline[]
  checklists: ChecklistFile[]
  universities: University[]
}) {
  const [showTax, setShowTax] = useState(false)
  const kr = deadlines.filter((d) => d.country === 'KR')
  const us = deadlines.filter((d) => d.country === 'US')

  return (
    <section className="panel active">
      <div className="card">
        <h3>
          Business & Projects <span className="pill">_data/business-deadlines.yml</span>
        </h3>
      </div>

      <div className="todo-group">
        <h2 className="todo-group-title">Milestones &amp; projects</h2>
        <div className="checklist-row">
          {checklists.map((c) => (
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
              Reminder list, not tax advice — confirm dates and applicability with your 세무사 / accountant.
            </div>
            <div className="checklist-row">
              <DeadlineCard country="KR" deadlines={kr} />
              <DeadlineCard country="US" deadlines={us} />
            </div>
          </>
        )}
      </div>
    </section>
  )
}
