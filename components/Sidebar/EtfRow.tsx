'use client'

import type { EtfDeclaration } from '@/lib/types'
import { useStocks } from '@/lib/useStock'
import { sparkPoints } from '@/lib/sparkline'

function EtfStripRow({ etf }: { etf: EtfDeclaration }) {
  const results = useStocks([etf.symbol])
  const r = results[etf.symbol]
  const color = etf.color ? `var(${etf.color})` : 'var(--text-dim)'
  const up = r?.changePct != null && r.changePct >= 0

  return (
    <div className="habit-row">
      <div className="hr-top">
        <div className="h-name">
          <span className="h-dot" style={{ background: color }} />
          <span className="hide-on-collapse">{etf.label}</span>
        </div>
        <div className="hide-on-collapse">
          {r?.price != null ? (
            <>
              <span className="h-current">${r.price.toFixed(2)}</span>
              {r.changePct != null && (
                <span className="h-delta" style={{ color: up ? 'var(--green)' : 'var(--red)' }}>
                  {up ? '+' : ''}
                  {r.changePct.toFixed(2)}%
                </span>
              )}
            </>
          ) : (
            <span className="h-delta">loading…</span>
          )}
        </div>
      </div>
      {r?.series && r.series.length > 1 && (
        <svg className="spark hide-on-collapse" viewBox="0 0 160 20" preserveAspectRatio="none">
          <polyline points={sparkPoints(r.series)} fill="none" stroke={color} strokeWidth="2" />
        </svg>
      )}
    </div>
  )
}

export function EtfRow({ etfs }: { etfs: EtfDeclaration[] }) {
  if (etfs.length === 0) return null
  return (
    <div className="sb-section">
      <h2 className="hide-on-collapse">ETFs</h2>
      {etfs.map((etf) => (
        <EtfStripRow etf={etf} key={etf.symbol} />
      ))}
    </div>
  )
}
