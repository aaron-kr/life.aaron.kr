'use client'

import type { ChecklistFile } from '@/lib/types'
import { useChecklistState } from '@/lib/firestore-hooks'
import { slugify } from '@/lib/slug'
import { ChecklistCard, type ChecklistCardItem } from './ChecklistCard'

export function ChecklistSection({ checklist }: { checklist: ChecklistFile }) {
  const { state, setDone, remove } = useChecklistState(checklist.id)

  const items: ChecklistCardItem[] = checklist.items
    .map((it) => {
      const slug = slugify(it.text)
      const s = state[slug]
      return { id: slug, text: it.text, meta: it.meta, urgent: it.urgent, done: Boolean(s?.done) }
    })
    .filter((it) => !state[it.id]?.removed)

  return (
    <ChecklistCard
      title={checklist.title}
      items={items}
      onToggle={(id, done) => void setDone(id, done)}
      onRemove={(id) => void remove(id)}
    />
  )
}
