'use client'

import type { GoalChecklistItem, GoalListFile, GoalTickerItem } from '@/lib/types'
import { useGoalItemState } from '@/lib/firestore-hooks'
import { slugify } from '@/lib/slug'

function ChecklistAccordion({ list }: { list: GoalListFile }) {
  const { state, toggle } = useGoalItemState(list.id)
  const items = list.items as GoalChecklistItem[]
  return (
    <details className="acc">
      <summary>{list.title}</summary>
      <ul>
        {items.map((item) => {
          const slug = slugify(item.text)
          const done = Boolean(state[slug])
          return (
            <li key={slug}>
              <input type="checkbox" checked={done} onChange={(e) => void toggle(slug, e.target.checked)} />
              <span>{item.text}</span>
            </li>
          )
        })}
      </ul>
    </details>
  )
}

function TickerAccordion({ list }: { list: GoalListFile }) {
  const items = list.items as GoalTickerItem[]
  return (
    <details className="acc">
      <summary>{list.title}</summary>
      <div style={{ marginTop: 10 }}>
        {items.map((item) => (
          <div className="ticker-row" key={item.sym}>
            <span className="tsym">{item.sym}</span>
            <span>${item.price}</span>
            <span className={`tchg ${item.up ? 'up' : 'down'}`}>{item.chg}</span>
          </div>
        ))}
      </div>
    </details>
  )
}

export function GoalAccordions({ goalLists }: { goalLists: GoalListFile[] }) {
  if (goalLists.length === 0) return null
  return (
    <div className="sb-section hide-on-collapse">
      {goalLists.map((list) =>
        list.type === 'ticker' ? <TickerAccordion list={list} key={list.id} /> : <ChecklistAccordion list={list} key={list.id} />
      )}
    </div>
  )
}
