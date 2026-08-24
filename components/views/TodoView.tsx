import type { ChecklistFile, University } from '@/lib/types'
import { ChecklistSection } from '../Checklist/ChecklistSection'

const DEFAULT_GROUP = 'General'
const GROUP_ORDER = [DEFAULT_GROUP, 'Schools']

export function TodoView({ checklists, universities }: { checklists: ChecklistFile[]; universities: University[] }) {
  const groups = new Map<string, ChecklistFile[]>()
  checklists.forEach((c) => {
    const g = c.group || DEFAULT_GROUP
    const list = groups.get(g) ?? []
    list.push(c)
    groups.set(g, list)
  })

  const orderedGroups = [
    ...GROUP_ORDER.filter((g) => groups.has(g)),
    ...Array.from(groups.keys()).filter((g) => !GROUP_ORDER.includes(g)),
  ]

  return (
    <section className="panel active">
      {orderedGroups.map((group) => (
        <div className="todo-group" key={group}>
          <h2 className="todo-group-title">{group}</h2>
          <div className="checklist-row">
            {groups.get(group)!.map((c) => (
              <ChecklistSection checklist={c} universities={universities} key={c.id} />
            ))}
          </div>
        </div>
      ))}
      <div className="todo-group">
        <div className="checklist-row">
          <div className="new-checklist-card">
            + new checklist
            <br />
            (add a file to _data/checklists/)
          </div>
        </div>
      </div>
    </section>
  )
}
