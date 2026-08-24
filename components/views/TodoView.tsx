import type { ChecklistFile } from '@/lib/types'
import { ChecklistSection } from '../Checklist/ChecklistSection'

export function TodoView({ checklists }: { checklists: ChecklistFile[] }) {
  return (
    <section className="panel active">
      <div className="checklist-row">
        {checklists.map((c) => (
          <ChecklistSection checklist={c} key={c.id} />
        ))}
        <div className="new-checklist-card">
          + new checklist
          <br />
          (add a file to _data/checklists/)
        </div>
      </div>
    </section>
  )
}
