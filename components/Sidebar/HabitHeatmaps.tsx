'use client'

import type { HabitDeclaration } from '@/lib/types'
import { useHabitCheckins } from '@/lib/firestore-hooks'
import { addDays, mondayOfWeek, sameDate, todayLocal, ymd } from '@/lib/dates'

const WEEKS = 14
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function currentStreak(checkins: Record<string, boolean>, today: Date): number {
  let streak = 0
  let d = today
  while (checkins[ymd(d)]) {
    streak++
    d = addDays(d, -1)
  }
  return streak
}

function HabitRow({ habit }: { habit: HabitDeclaration }) {
  const { checkins, toggle } = useHabitCheckins(habit.log)
  const today = todayLocal()
  const gridStart = addDays(mondayOfWeek(today), -7 * (WEEKS - 1))
  const streak = currentStreak(checkins, today)
  const color = `var(${habit.color})`

  const cells: { date: Date; col: number; row: number }[] = []
  for (let col = 0; col < WEEKS; col++) {
    for (let row = 0; row < 7; row++) {
      cells.push({ date: addDays(gridStart, col * 7 + row), col, row })
    }
  }

  return (
    <div className="habit-row">
      <div className="hr-top">
        <div className="h-name">
          <span className="h-dot" style={{ background: color }} />
          <span className="hide-on-collapse">{habit.label}</span>
        </div>
        <div className="streak hide-on-collapse">{streak}d streak</div>
      </div>
      <div className="heat-wrap hide-on-collapse">
        <div className="heat-daylabels">
          {DAY_LABELS.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
        <div className="habit-grid7" style={{ ['--sq-color' as string]: color }}>
          {cells.map(({ date }) => {
            const key = ymd(date)
            const isFuture = date > today
            const isToday = sameDate(date, today)
            const on = Boolean(checkins[key])
            return (
              <div
                key={key}
                className={`sq${on ? ' on' : ''}${isToday ? ' today' : ''}${isFuture ? ' future' : ''}`}
                title={key}
                onClick={() => !isFuture && void toggle(key)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function HabitHeatmaps({ habits }: { habits: HabitDeclaration[] }) {
  if (habits.length === 0) return null
  return (
    <div className="sb-section">
      <h2 className="hide-on-collapse">Habits</h2>
      {habits.map((h) => (
        <HabitRow habit={h} key={h.id} />
      ))}
    </div>
  )
}
