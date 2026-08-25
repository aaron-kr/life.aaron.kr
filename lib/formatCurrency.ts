const SYMBOLS: Record<string, string> = { USD: '$', KRW: '₩', EUR: '€', GBP: '£', JPY: '¥' }

/** Yahoo reports each symbol's native currency automatically (KRW for
 * KODEX/TIGER tickers, USD for US ETFs, etc.) — no per-ETF config needed.
 * KRW conventionally shows no decimals; everything else gets 2. */
export function formatPrice(price: number, currency: string | null): string {
  const symbol = currency ? (SYMBOLS[currency] ?? '') : '$'
  const decimals = currency === 'KRW' || currency === 'JPY' ? 0 : 2
  const formatted = price.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return symbol ? `${symbol}${formatted}` : `${formatted} ${currency ?? ''}`.trim()
}
