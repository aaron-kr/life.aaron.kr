# Compass — Personal Dashboard

*(working title — rename freely; ties to the "North Star" long-range-goals section)*

A single-page personal dashboard: semester schedule (Sun–Sat, 30-min granularity,
printable / exportable as a JPG), per-city daily weather, rolling transportation
ticket checklist, lecture prep / grading / school-admin checklists, habit streaks
+ live ETF prices (auto-converted to each ticker's native currency), body stats,
Business/tax filing reminders + milestone-style project checklists, a Jobs view
(job-search reminders, a Google Alert feed, a Drive link), and a small set of
"systems" reminders (US-return prep, long-range goals) — replacing a mix of
Google Calendar, HabitKit, and 데일리 스케쥴.

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
| `--blue` | `#5fa8e0` | class blocks (Week view default) |
| `--green` | `#6fcf97` | family blocks, habit-positive, Month "family" flag |
| `--gold` | `#d4af6a` | church blocks, quote-verse accent |
| `--pink` | `#f0899f` | gym blocks, deadlines |
| `--silver` | `#b7bfd6` | deep-work blocks |
| `--teal` | `#5fd6c8` | overflow/guest category |
| `--red` | `#e2637a` | Sundays, holidays |
| `--yellow` | `#e0c568` | make-up days |

Per-block colors in `_data/weekly.yml` and per-course colors in
`_data/course-sources.yml` can override any of the above — these are just the
defaults per block `type`.

Fonts: `Playfair Display` (headings/quotes), `IBM Plex Mono` (labels, data, time),
`IBM Plex Sans` / `IBM Plex Sans KR` (body).

## Status

Real Next.js app, builds and lints clean, live in daily use — Firebase, real
schedule/course data, and OpenWeatherMap are all configured. Five views (Week/
Month/Semester/To-Do/Jobs — Jobs and Business used to be separate tabs, now
one view with two side-by-side columns), the sidebar (weather hero, habits,
goal accordions), and the top stats strip (body stats, semester stats, live
ETF prices) are wired up end-to-end against real Firestore, weather, and
Yahoo Finance data — not mock data. The active view **and** the stats strip's
shown/hidden state persist across devices via Firestore (`settings/ui`).

Known soft spots, not bugs exactly:
- `_data/bible-plan.yml` only has 3 placeholder days — add your own plan.
- `_data/business-deadlines.yml` needs a once-over from an actual accountant
  before you trust the specific dates.
- `_data/jobs.yml`'s `alert_rss_url` and `drive_url` are blank until you fill
  them in — see the comments in that file for how to get a Google Alerts RSS
  link.
- `public/images/weather/` and `public/images/hero/` are asset folders you
  populate yourself (see each folder's README) — the app degrades gracefully
  to a plain gradient without them.
- **`_data/tickets.yml` has a real bug worth fixing by hand**: two entries
  share `id: wed-from-iksan` (one under Wednesday, one mislabeled under
  Thursday with stale Wednesday route text) — since a ticket's saved state is
  keyed by that id, the two routes currently overwrite each other's
  purchased/time/seat state in Firestore. The Friday entries also look like
  copy-pasted placeholders (route text and `short` label both still say
  "Thur"). This wasn't touched automatically since only you know the actual
  Thursday/Friday route times.
