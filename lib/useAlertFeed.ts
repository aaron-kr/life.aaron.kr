'use client'

import { useEffect, useState } from 'react'
import type { AlertFeedItem } from './types'

export function useAlertFeed(feedUrl: string) {
  const [items, setItems] = useState<AlertFeedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!feedUrl) return
    let cancelled = false
    setLoading(true)
    setError(false)
    fetch(`/api/alerts?feed=${encodeURIComponent(feedUrl)}`)
      .then((r) => r.json())
      .then((data: { items?: AlertFeedItem[]; error?: unknown }) => {
        if (cancelled) return
        setItems(data.items ?? [])
        setError(Boolean(data.error))
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [feedUrl])

  return { items, loading, error }
}
