'use client'

import { useEffect, useState } from 'react'

export function WaveToggleButton() {
  const [on, setOn] = useState(true)

  useEffect(() => {
    setOn(!document.documentElement.classList.contains('waves-off'))
  }, [])

  function toggle() {
    const next = !on
    document.documentElement.classList.toggle('waves-off', !next)
    try {
      localStorage.setItem('waves', next ? 'on' : 'off')
    } catch {}
    setOn(next)
  }

  return (
    <button className="icon-btn" onClick={toggle} title="Toggle wave animation" aria-pressed={on}>
      {on ? '🌊' : '〰'}
    </button>
  )
}
