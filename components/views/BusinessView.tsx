import type { BusinessDeadline } from '@/lib/types'

function DeadlineCard({ country, deadlines }: { country: string; deadlines: BusinessDeadline[] }) {
  return (
    <div className="checklist-card">
      <h4>{country === 'KR' ? '🇰🇷 Korea' : '🇺🇸 United States'}</h4>
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

export function BusinessView({ deadlines }: { deadlines: BusinessDeadline[] }) {
  const kr = deadlines.filter((d) => d.country === 'KR')
  const us = deadlines.filter((d) => d.country === 'US')

  return (
    <section className="panel active">
      <div className="card">
        <h3>
          Business & Tax <span className="pill">_data/business-deadlines.yml</span>
        </h3>
        <div className="biz-disclaimer">
          Reminder list, not tax advice — confirm dates and applicability with your 세무사 / accountant.
        </div>
      </div>
      <div className="checklist-row">
        <DeadlineCard country="KR" deadlines={kr} />
        <DeadlineCard country="US" deadlines={us} />
      </div>
    </section>
  )
}
