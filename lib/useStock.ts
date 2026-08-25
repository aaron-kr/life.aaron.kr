'use client'

import { useEffect, useState } from 'react'

export interface StockResult {
  symbol: string
  price: number | null
  changePct: number | null
  series: number[]
  currency: string | null
}

const EMPTY: StockResult = { symbol: '', price: null, changePct: null, series: [], currency: null }

export function useStocks(symbols: string[]) {
  const [results, setResults] = useState<Record<string, StockResult>>({})
  const depKey = symbols.join('|')

  useEffect(() => {
    let cancelled = false
    symbols.forEach(async (symbol) => {
      try {
        const res = await fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}`)
        const data = (await res.json()) as StockResult
        if (!cancelled) setResults((prev) => ({ ...prev, [symbol]: data }))
      } catch {
        if (!cancelled) setResults((prev) => ({ ...prev, [symbol]: { ...EMPTY, symbol } }))
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey])

  return results
}
