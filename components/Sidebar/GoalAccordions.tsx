'use client'

import type { GoalListFile } from '@/lib/types'
import { useGoalItemState } from '@/lib/firestore-hooks'
import { slugify } from '@/lib/slug'

function ChecklistAccordion({ list }: { list: GoalListFile }) {
  const { state, toggle } = useGoalItemState(list.id)
  return (
    <details className="acc">
      <summary>{list.title}</summary>
      <ul>
        {list.items.map((item) => {
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

export function GoalAccordions({ goalLists }: { goalLists: GoalListFile[] }) {
  if (goalLists.length === 0) return null
  return (
    <div className="sb-section hide-on-collapse">
      {goalLists.map((list) => (
        <ChecklistAccordion list={list} key={list.id} />
      ))}
    </div>
  )
}
