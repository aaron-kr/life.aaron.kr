'use client'

import { useEffect, useRef, useState } from 'react'
import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from './auth-context'
import type { View } from './types'

export interface StatEntry {
  id: string
  date: string
  value: number
  note?: string
}

/** stat_logs/{logId}/entries/{autoId} — { date, value, note? } */
export function useStatLog(logId: string) {
  const { status } = useAuth()
  const [entries, setEntries] = useState<StatEntry[]>([])

  useEffect(() => {
    if (status !== 'signed-in' || !logId) return
    const q = query(collection(db, 'stat_logs', logId, 'entries'), orderBy('date', 'desc'))
    return onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StatEntry, 'id'>) })))
    })
  }, [logId, status])

  async function addEntry(date: string, value: number, note?: string) {
    await addDoc(collection(db, 'stat_logs', logId, 'entries'), {
      date,
      value,
      ...(note ? { note } : {}),
      createdAt: serverTimestamp(),
    })
  }

  return { entries, addEntry }
}

/** habit_checkins/{habitId}/entries/{date} — { done } */
export function useHabitCheckins(habitId: string) {
  const { status } = useAuth()
  const [checkins, setCheckins] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (status !== 'signed-in' || !habitId) return
    return onSnapshot(collection(db, 'habit_checkins', habitId, 'entries'), (snap) => {
      const map: Record<string, boolean> = {}
      snap.docs.forEach((d) => {
        map[d.id] = Boolean(d.data().done)
      })
      setCheckins(map)
    })
  }, [habitId, status])

  async function toggle(date: string) {
    const next = !checkins[date]
    await setDoc(doc(db, 'habit_checkins', habitId, 'entries', date), { done: next })
  }

  return { checkins, toggle }
}

export interface ChecklistItemState {
  done: boolean
  removed: boolean
}

/** checklist_state/{checklistId}/items/{itemSlug} — { done, removed } */
export function useChecklistState(checklistId: string) {
  const { status } = useAuth()
  const [state, setState] = useState<Record<string, ChecklistItemState>>({})

  useEffect(() => {
    if (status !== 'signed-in' || !checklistId) return
    return onSnapshot(collection(db, 'checklist_state', checklistId, 'items'), (snap) => {
      const map: Record<string, ChecklistItemState> = {}
      snap.docs.forEach((d) => {
        const data = d.data()
        map[d.id] = { done: Boolean(data.done), removed: Boolean(data.removed) }
      })
      setState(map)
    })
  }, [checklistId, status])

  async function setDone(itemSlug: string, done: boolean) {
    await setDoc(doc(db, 'checklist_state', checklistId, 'items', itemSlug), { done, removed: false }, { merge: true })
  }

  async function remove(itemSlug: string) {
    await setDoc(doc(db, 'checklist_state', checklistId, 'items', itemSlug), { removed: true }, { merge: true })
  }

  return { state, setDone, remove }
}

/** goal_items/{listId}/items/{itemSlug} — { done } */
export function useGoalItemState(listId: string) {
  const { status } = useAuth()
  const [state, setState] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (status !== 'signed-in' || !listId) return
    return onSnapshot(collection(db, 'goal_items', listId, 'items'), (snap) => {
      const map: Record<string, boolean> = {}
      snap.docs.forEach((d) => {
        map[d.id] = Boolean(d.data().done)
      })
      setState(map)
    })
  }, [listId, status])

  async function toggle(itemSlug: string, done: boolean) {
    await setDoc(doc(db, 'goal_items', listId, 'items', itemSlug), { done })
  }

  return { state, toggle }
}

export interface TicketState {
  purchased: boolean
  dismissed?: boolean
  time?: string
  seat?: string
}

/** tickets/{ticketId} — { purchased, dismissed?, time?, seat? }, ticketId =
 * `${routeId}_${weekOfYmd}`. `dismissed` is for occurrences you're skipping
 * without ever entering purchase details (e.g. a route you just show up
 * for) — same "move it out of the active list" effect as purchasing, minus
 * the time/seat form.
 *
 * `pending` is the same optimistic-overlay pattern as `useUiSettings`'s
 * `statsCollapsed` (see there for why): save/dismiss/undo update it
 * immediately so the row visibly moves before the Firestore round-trip
 * finishes, rather than waiting on `onSnapshot` to reflect a change that
 * already happened locally. A `null` entry means "treat as deleted" (for
 * undo) — plain `delete`ing the key would just fall back to showing
 * whatever `tickets` still has for it, which is exactly the stale state
 * undo is trying to clear. Each fresh snapshot clears the whole overlay,
 * since by then it's already reflected there. */
export function useTickets() {
  const { status } = useAuth()
  const [tickets, setTickets] = useState<Record<string, TicketState>>({})
  const [pending, setPending] = useState<Record<string, TicketState | null>>({})

  useEffect(() => {
    if (status !== 'signed-in') return
    return onSnapshot(collection(db, 'tickets'), (snap) => {
      const map: Record<string, TicketState> = {}
      snap.docs.forEach((d) => {
        map[d.id] = d.data() as TicketState
      })
      setTickets(map)
      setPending({})
    })
  }, [status])

  function save(ticketId: string, time: string, seat: string) {
    setPending((p) => ({ ...p, [ticketId]: { purchased: true, time, seat } }))
    setDoc(doc(db, 'tickets', ticketId), { purchased: true, time, seat }).catch(() => {})
  }

  function dismiss(ticketId: string) {
    setPending((p) => ({ ...p, [ticketId]: { purchased: false, dismissed: true } }))
    setDoc(doc(db, 'tickets', ticketId), { dismissed: true }).catch(() => {})
  }

  function undo(ticketId: string) {
    setPending((p) => ({ ...p, [ticketId]: null }))
    deleteDoc(doc(db, 'tickets', ticketId)).catch(() => {})
  }

  const merged = { ...tickets }
  Object.entries(pending).forEach(([id, v]) => {
    if (v === null) delete merged[id]
    else merged[id] = v
  })

  return { tickets: merged, save, dismiss, undo }
}

/** settings/ui — { lastView, statsCollapsed } — small cross-device UI prefs.
 * One doc, one listener, for anything in this "remember this across devices"
 * category — add more fields here rather than opening a second listener on
 * the same document. */
export function useUiSettings() {
  const { status } = useAuth()
  const [lastView, setLastViewState] = useState<View | null>(null)
  const [statsCollapsed, setStatsCollapsedState] = useState(false)
  // Firestore's own value should only ever *seed* the local toggle once (so
  // a stale device jumps to whatever the last device set) — after that, the
  // click itself is the source of truth. Without this guard, a slow/failed
  // round trip (or the listener re-firing your own write back at you) can
  // silently stomp the very click that just happened, which is exactly what
  // made this button feel broken.
  const statsInitialized = useRef(false)

  useEffect(() => {
    if (status !== 'signed-in') return
    return onSnapshot(doc(db, 'settings', 'ui'), (snap) => {
      const data = snap.data()
      if (data?.lastView) setLastViewState(data.lastView as View)
      if (typeof data?.statsCollapsed === 'boolean' && !statsInitialized.current) {
        setStatsCollapsedState(data.statsCollapsed)
        statsInitialized.current = true
      }
    })
  }, [status])

  async function setLastView(view: View) {
    await setDoc(doc(db, 'settings', 'ui'), { lastView: view }, { merge: true })
  }

  function setStatsCollapsed(collapsed: boolean) {
    statsInitialized.current = true
    setStatsCollapsedState(collapsed) // instant, regardless of network state
    setDoc(doc(db, 'settings', 'ui'), { statsCollapsed: collapsed }, { merge: true }).catch(() => {})
  }

  return { lastView, setLastView, statsCollapsed, setStatsCollapsed }
}
