import { NextRequest, NextResponse } from 'next/server'

// Yahoo Finance's unofficial chart endpoint — free, no API key, no signup.
// (Stooq's CSV export, the original choice here, now sits behind a
// JS proof-of-work bot check that a plain server fetch can't satisfy.)
const YAHOO_URL = (symbol: string, range: string, interval: string) =>
  `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`

// Allowlisted so the `range`/`interval` query params (client-controlled)
// can't be used to probe arbitrary Yahoo chart requests — these are exactly
// the pairs the Jobs/Business ETF period buttons offer.
const ALLOWED_RANGES = new Set(['1d', '5d', '1mo', '1y', '5y', '10y'])
const ALLOWED_INTERVALS = new Set(['5m', '30m', '1d', '1wk', '3mo'])

interface YahooChartResponse {
  chart: {
    result: {
      meta: { regularMarketPrice?: number; chartPreviousClose?: number; currency?: string }
      indicators: { quote: { close: (number | null)[] }[] }
    }[]
    error: unknown
  }
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')
  if (!symbol) return NextResponse.json({ error: 'symbol is required' }, { status: 400 })

  const rangeParam = req.nextUrl.searchParams.get('range') ?? ''
  const intervalParam = req.nextUrl.searchParams.get('interval') ?? ''
  const range = ALLOWED_RANGES.has(rangeParam) ? rangeParam : '1mo'
  const interval = ALLOWED_INTERVALS.has(intervalParam) ? intervalParam : '1d'

  try {
    const res = await fetch(YAHOO_URL(symbol, range, interval), {
      next: { revalidate: 3600 },
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; life.aaron.kr dashboard)' },
    })
    if (!res.ok) throw new Error(`Yahoo ${res.status}`)
    const data = (await res.json()) as YahooChartResponse
    const result = data.chart.result?.[0]
    if (!result) {
      return NextResponse.json({
        symbol,
        price: null,
        changePct: null,
        series: [],
        currency: null,
        range,
        interval,
        configured: true,
      })
    }

    const price = result.meta.regularMarketPrice ?? null
    const prevClose = result.meta.chartPreviousClose ?? null
    const changePct = price != null && prevClose ? ((price - prevClose) / prevClose) * 100 : null
    const series = (result.indicators.quote[0]?.close ?? []).filter((c): c is number => c != null)
    const currency = result.meta.currency ?? null

    return NextResponse.json({ symbol, price, changePct, series, currency, range, interval, configured: true })
  } catch {
    return NextResponse.json({
      symbol,
      price: null,
      changePct: null,
      series: [],
      currency: null,
      range,
      interval,
      configured: true,
      error: true,
    })
  }
}
