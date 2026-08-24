# Compass — Personal Dashboard

*(working title — rename freely; ties to the "North Star" long-range-goals section)*

A single-page personal dashboard: semester schedule, per-city daily weather, rolling
transportation ticket checklist, lecture prep / grading checklists, habit streaks,
body stats, and a small set of "systems" reminders (US-return prep, long-range goals) —
replacing a mix of Google Calendar, HabitKit, and 데일리 스케쥴.

Companion sites, same design language (Playfair Display / IBM Plex Mono+Sans, dark
indigo-black theme):
- **pailab.io** — PAI Lab / research (Astro)
- **courses.aaron.kr** — courses (static HTML) — **source of truth for class schedule**
- **aaronsnowberger.com / aaron.kr** — personal / CV
- **servo.aaron.kr** — Physical AI news aggregator

This dashboard is a fourth, separate site. It **reads** class-schedule data from
`courses.aaron.kr`'s repo but does not modify it.

## What's in this repo

- `app/`, `components/`, `lib/` — the real Next.js + TypeScript app.
- `_data/*.yml` — hand-edited content (schedule template, holidays, checklists,
  goal lists, stat/habit declarations). Edit these directly; no rebuild needed
  beyond a normal git push. See **DEPLOY.md → Everyday editing**.
- `dashboard-mockup.html` — the original static visual mockup, kept for
  reference. The real app in `app/`/`components/` ports its CSS and layout
  directly (same class names throughout).
- `CLAUDE.md` — architecture, data schema, and the design decisions the build
  followed.
- `DEPLOY.md` — **start here** for first-time setup (Firebase project,
  `.env.local`, running the dev server, deploying to Vercel).
- `firestore.rules` — paste into the Firebase console; locks every collection
  to one allow-listed email.

## Quick start

```bash
npm install
cp .env.local.example .env.local   # then fill in Firebase config — see DEPLOY.md
npm run dev
```

Full walkthrough (creating the Firebase project, filling in env vars,
deploying to Vercel): **[DEPLOY.md](DEPLOY.md)**.

Stack:
- **Next.js 15 / React 19 / TypeScript**, App Router, plain CSS (no Tailwind —
  matches `aaron.kr`'s approach; the mockup's hand-tuned CSS ports directly).
- **Firebase Auth** (Google sign-in, restricted to one email — same pattern as
  `courses.aaron.kr/attend`) + **Firestore** for anything checked off or
  logged (habit check-ins, ticket purchases, weight/waist/km entries,
  checklist done-state).
- **YAML** (`_data/`) for anything set once a semester and rarely changed.
- Course schedules are **fetched, not duplicated** — `_data/course-sources.yml`
  lists a raw GitHub link per course (any number of them), each pointing at
  that course's lecture YAML in `courses.aaron.kr`. The Semester view renders
  one column per course from whatever's live there.

## Design tokens (carried over from pailab.io / SERVO)

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#0a0b17` | page background |
| `--panel` | `#12142a` | cards, sidebar |
| `--panel-2` | `#171a35` | nested surfaces, headers |
| `--border` | `#262a4a` | standard border |
| `--violet` | `#9b8cf2` | brand / primary actions |
| `--blue` | `#5fa8e0` | classes / Yonsei |
| `--green` | `#6fcf97` | family / SKKU / habit-positive |
| `--gold` | `#d4af6a` | church / Hanyang / quote-verse accent |
| `--pink` | `#f0899f` | gym / Korea Univ / deadlines |
| `--teal` | `#5fd6c8` | guest lectures / overflow category |
| `--red` | `#e2637a` | Sundays, holidays |
| `--yellow` | `#e0c568` | make-up days |

Fonts: `Playfair Display` (headings/quotes), `IBM Plex Mono` (labels, data, time),
`IBM Plex Sans` / `IBM Plex Sans KR` (body).

## Status

Real Next.js app, builds and lints clean. All four views (Week/Month/Semester/
To-Do), the sidebar (mini-week weather, body stats, habit heatmaps, semester
stats, goal accordions), the ticket drawer, and the wave background toggle are
wired up end-to-end against real Firestore + a real weather API route — not
mock data. What's left is filling in **your** data: a real Firebase project
(DEPLOY.md), the real weekday→city/university mapping in
`_data/weekly.yml` (still the mockup's placeholder cities), and an
OpenWeatherMap key if you want live weather instead of `—`.
