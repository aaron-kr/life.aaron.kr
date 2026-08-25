import { NextRequest, NextResponse } from 'next/server'

// Yahoo Finance's unofficial chart endpoint — free, no API key, no signup.
// (Stooq's CSV export, the original choice here, now sits behind a
// JS proof-of-work bot check that a plain server fetch can't satisfy.)
const YAHOO_URL = (symbol: string) =>
  `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d`

interface YahooChartResponse {
  chart: {
    result: {
      meta: { regularMarketPrice?: number; chartPreviousClose?: number }
      indicators: { quote: { close: (number | null)[] }[] }
    }[]
    error: unknown
  }
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')
  if (!symbol) return NextResponse.json({ error: 'symbol is required' }, { status: 400 })

  try {
    const res = await fetch(YAHOO_URL(symbol), {
      next: { revalidate: 3600 },
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; life.aaron.kr dashboard)' },
    })
    if (!res.ok) throw new Error(`Yahoo ${res.status}`)
    const data = (await res.json()) as YahooChartResponse
    const result = data.chart.result?.[0]
    if (!result) {
      return NextResponse.json({ symbol, price: null, changePct: null, series: [], configured: true })
    }

    const price = result.meta.regularMarketPrice ?? null
    const prevClose = result.meta.chartPreviousClose ?? null
    const changePct = price != null && prevClose ? ((price - prevClose) / prevClose) * 100 : null
    const series = (result.indicators.quote[0]?.close ?? []).filter((c): c is number => c != null)

    return NextResponse.json({ symbol, price, changePct, series, configured: true })
  } catch {
    return NextResponse.json({ symbol, price: null, changePct: null, series: [], configured: true, error: true })
  }
}
