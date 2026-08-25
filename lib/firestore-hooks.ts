'use client'

import { useEffect, useState } from 'react'
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
  time?: string
  seat?: string
}

/** tickets/{ticketId} — { purchased, time?, seat? }, ticketId = `${routeId}_${weekOfYmd}` */
export function useTickets() {
  const { status } = useAuth()
  const [tickets, setTickets] = useState<Record<string, TicketState>>({})

  useEffect(() => {
    if (status !== 'signed-in') return
    return onSnapshot(collection(db, 'tickets'), (snap) => {
      const map: Record<string, TicketState> = {}
      snap.docs.forEach((d) => {
        map[d.id] = d.data() as TicketState
      })
      setTickets(map)
    })
  }, [status])

  async function save(ticketId: string, time: string, seat: string) {
    await setDoc(doc(db, 'tickets', ticketId), { purchased: true, time, seat })
  }

  async function undo(ticketId: string) {
    await deleteDoc(doc(db, 'tickets', ticketId))
  }

  return { tickets, save, undo }
}

/** settings/ui — { lastView, statsCollapsed } — small cross-device UI prefs.
 * One doc, one listener, for anything in this "remember this across devices"
 * category — add more fields here rather than opening a second listener on
 * the same document. */
export function useUiSettings() {
  const { status } = useAuth()
  const [lastView, setLastViewState] = useState<View | null>(null)
  const [statsCollapsed, setStatsCollapsedState] = useState<boolean | null>(null)

  useEffect(() => {
    if (status !== 'signed-in') return
    return onSnapshot(doc(db, 'settings', 'ui'), (snap) => {
      const data = snap.data()
      if (data?.lastView) setLastViewState(data.lastView as View)
      if (typeof data?.statsCollapsed === 'boolean') setStatsCollapsedState(data.statsCollapsed)
    })
  }, [status])

  async function setLastView(view: View) {
    await setDoc(doc(db, 'settings', 'ui'), { lastView: view }, { merge: true })
  }

  async function setStatsCollapsed(collapsed: boolean) {
    await setDoc(doc(db, 'settings', 'ui'), { statsCollapsed: collapsed }, { merge: true })
  }

  return { lastView, setLastView, statsCollapsed, setStatsCollapsed }
}
