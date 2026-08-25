# CLAUDE.md — Compass Personal Dashboard

Session handoff for continuing this project in Claude Code / VS Code. Read this
before writing code. `dashboard-mockup.html` is the visual/interaction reference —
open it in a browser alongside this doc.

## What this project is

A single-page personal dashboard for Aaron: semester schedule (5 universities,
one weekday each), per-weekday-city weather, a rolling transportation-ticket
checklist, lecture-prep / grading / custom checklists, GitHub-style habit streaks,
body stats (weight/waist/rucking/bench), and a small "systems" area for long-range
goals (US-return prep, ETFs). Built to replace Google Calendar (got crowded),
HabitKit (another phone app), and 데일리 스케쥴 (has ads).

Separate project from pailab.io / courses.aaron.kr / SERVO — shares design tokens
only. It **reads** `courses.aaron.kr`'s class-schedule YAML as an external source;
it does not live in that repo.

## Current state — read this first, then treat the rest of this file as historical design notes

Everything below "Stack decisions" was written **before** the build started
and documents the original plan. The plan mostly held, but drifted in a few
real ways worth knowing before assuming this file is current:

- **Not 5 universities, one weekday each** — it's grown to as many courses as
  are in `_data/course-sources.yml` (several schools have 2+ courses on the
  same weekday). `_data/course-sources.yml` is now the hub for
  course↔weekday↔university↔color, not the weekdays map in `_data/weekly.yml`
  (which now only carries city, for weather).
- **The Semester view isn't per-course columns** — it's weekday columns ×
  week rows (closer to the original mockup's transposed idea), with courses
  grouped under their declared weekday and past lectures dimmed.
- **universities.yml is fetched live**, not copied — `lib/universities.ts`
  pulls courses.aaron.kr's shared `_data/universities.yml` every hour, so
  logos/portal links update themselves; only *which courses you're teaching*
  needs manual editing each semester.
- **ETF prices are live** (Yahoo Finance's unofficial chart endpoint, no
  key), not manually typed — declared in `_data/etfs.yml`, rendered as a
  third row of the top **stats strip** (`components/StatsStrip.tsx`), not
  the sidebar — same sparkline-+-current-value styling as the body stats.
  Each ticker renders in its own native currency (Yahoo reports `meta.currency`
  per symbol — KRW for KODEX/TIGER funds, USD for US ETFs, etc.; see
  `lib/formatCurrency.ts`). Adding a new entry to `etfs.yml` auto-adds a card.
- **Weekday→city weather mapping split into its own file**, `_data/weather.yml`
  (was folded into `weekly.yml`) — the one thing Aaron kept losing track of,
  so it gets its own obviously-named file. `weekly.yml` now only holds
  `recurring_blocks`.
- **Three views were added** beyond the original four: a **Business** view
  (KR/US tax filing reminders — `_data/business-deadlines.yml`, collapsed by
  default via a show/hide button since it's reference material, not daily —
  plus milestone-style project checklists via `_data/checklists/*.yml` with
  `group: Business`, using each item's `meta` field as the target date), a
  **Jobs** view (`_data/jobs.yml` — target-position blurb, a Google Drive
  link, an optional Google Alert RSS feed proxied through `/api/alerts`, and
  job-search reminder checklists via `group: Jobs`), and the quote banner
  grew a companion **Bible reading plan** (`_data/bible-plan.yml`, keyed by
  `MM-DD` so it's year-agnostic).
- **Checklist `group` is now a routing key, not just a display heading** —
  `TodoView` renders every group except `Business` and `Jobs`, which get
  pulled into their own views instead (see `ELSEWHERE_GROUPS` in
  `components/views/TodoView.tsx`). Adding a checklist file with
  `group: Business` or `group: Jobs` sends it to that view automatically;
  any other (or no) group value stays in To-Do.
- **The active view *and* the stats strip's shown/hidden state persist
  across devices** via one `settings/ui` Firestore doc (`lib/firestore-hooks.ts`
  → `useUiSettings()`, replacing the old single-field `useLastView()`) — add
  more small cross-device UI prefs to that same doc/hook rather than opening
  a second listener.
- **Week view has print / save-image buttons** — `window.print()` with a
  dedicated `@media print` block (native browser dialog handles landscape vs.
  portrait), and a client-side JPG export via `html2canvas` targeting the
  `#week-print-area` node.
- **Quote banner arrows** are paired together in one hit-zone at the banner's
  right edge (`.quote-arrows-zone`), hidden by default and revealed on hover
  (desktop) or tap (mobile, via an `arrowsRevealed` state toggle) — they no
  longer sit split on either side of the quote text.
- **Everyday operation is documented in `DEPLOY.md` and `README.md`**, not
  here — this file is for architecture/history, those two are for "how do I
  change X." If you're about to explain how to edit something, check there
  first; don't let this file and those drift out of sync.

## Stack decisions

- **Next.js on Vercel** — chosen over Astro because this page is interactive
  throughout (view toggles, checkboxes, hover popovers, a live drawer), which
  suits Next's client-component model better than Astro's island architecture.
  Reuses the free-tier Vercel setup already in use for other projects.
- **Firebase Auth** — reuse the existing email-login implementation from other
  projects rather than rebuilding.
- **Firestore** — for anything mutated by clicking: habit check-ins, ticket
  purchase state (+ entered time/seat), checklist done-state, and logged
  measurements (weight, waist, rucking km, bench PR, deep-work hours, papers
  progress). One collection per log type, documents keyed by date.
- **YAML** — for anything set once a semester and edited by hand: the recurring
  weekly template, checklist definitions, goal-list definitions, holidays,
  weekday→city mapping, quotes/verses. Read at build time or via client fetch;
  no database round-trip needed for content that doesn't change daily.
- **Class schedule**: fetched live from `raw.githubusercontent.com/.../courses.aaron.kr/_data/class-schedule.yml`
  (or via Next's ISR with a short revalidate window) — **not copied**. One
  source of truth, edits to that file show up here automatically.

## Data files (proposed layout)

```
_data/
  weekly.yml                 # recurring weekly blocks + weekday→city map
  holidays.yml               # KR public holidays, school holidays, make-up days
  personal-events.yml        # family hikes, church events (manually added)
  quotes.yml                 # daily quote/verse rotation
  checklists/
    prep.yml
    grading.yml
    *.yml                    # any new file here = a new card in the To-Do view
  goal-lists/
    north-star.yml           # type: checklist
    etfs.yml                 # type: ticker
    *.yml                    # any new file here = a new sidebar accordion
  stats.yml                  # stat *declarations* (see "Stat types" below)
```

### `weekly.yml` (sketch)

```yaml
weekdays:
  monday:    { city: Chungju, university: null }   # fill in real per-day city/school
  tuesday:   { city: Jeonju,  university: null }
  wednesday: { city: Seoul,   university: Yonsei }
  thursday:  { city: Seoul,   university: KAIST }
  friday:    { city: Seoul,   university: SKKU }
recurring_blocks:
  - { day: monday, start: "17:00", end: "19:00", type: family }
  - { day: wednesday, start: "14:00", end: "16:00", type: no_phone }
  - { day: friday, start: "18:00", end: "19:30", type: church_prep }
  # etc — these are the semester-long defaults; daily overrides live in Firestore
  # as { date, ...same shape } documents that merge on top.
```

### `checklists/*.yml` (sketch) — this is the "just drop in a file" pattern

```yaml
title: Lecture Prep
items:
  - text: "Wed — Physical AI seminar slides"
    meta: "reused from spring, needs 3 new slides"
  - text: "Thu — grad advising notes"
    meta: "repeatable"
```
The To-Do view loops over every file in `checklists/` and renders one card per
file, in a `flex-wrap` row — no code change needed to add a checklist, matching
the mockup's `renderChecklistCard()` pattern.

### `goal-lists/*.yml` — same "file = widget" pattern, for sidebar accordions

```yaml
title: North Star — 3yr US return
type: checklist   # or "ticker"
items:
  - text: "File I-130 paperwork"
    done: false
```
Loop over `goal-lists/` and render one `<details class="acc">` per file. `type:
ticker` items render as symbol/price/change rows instead of checkboxes (see ETF
example in the mockup).

## Stat types (sidebar "Semester Stats")

Three distinct behaviors, declared per-stat in `stats.yml` and backed by a
Firestore log collection:

| type | meaning | display | example |
|---|---|---|---|
| `latest` | most recent logged value | current value + sparkline of recent history | Weight, Waist, Bench PR |
| `total` | running sum since a **user-set reset date** | total, hover popover shows last 5–10 entries | KM rucked, Deep-work hrs |
| `fraction` | x / goal | `x / y` + thin thermometer bar (`width: x/y * 100%`) | Papers submitted |

```yaml
# stats.yml sketch
- id: weight
  label: Weight
  type: latest
  unit: kg
  log: weight_log          # firestore collection
- id: km_rucked
  label: KM rucked
  type: total
  unit: km
  log: ruck_log
  reset_date: 2026-09-01   # user-editable "start counting from" date
- id: papers
  label: Papers submitted
  type: fraction
  goal: 2
  log: papers_log
```
Log documents are simple: `{ date, value }` (or `{ date, value, note }`). `total`
sums all entries where `date >= reset_date`. `latest` takes the max-date entry.

## Component behavior specs

### Ticket checklist (drawer, global — not tied to a view)
- Icon button in the header, badge shows count of open items across all windows.
- Grouped by rolling window computed from **today**, not stored: *This week* /
  *Next week* / *3–4 weeks out* (i.e. `today` → `today+28d`). The "shifts every
  Sunday" behavior falls out naturally from this — no cron job needed.
- Checking an item reveals an inline form (time, seat) rather than an OS `prompt()`.
- Saving collapses the row into a slim right-aligned chip (`✓ short-label · time`);
  hovering the chip reveals an "undo" link that restores the row and unchecks it.
- Persisted to Firestore as `{ date, route, purchased: true, time, seat }`.

### Generic checklists (Prep, Grading, custom, To-Do view)
- Checking an item moves it into a collapsed "N done — click to expand" strip at
  the bottom of its card (not deleted). Expanding shows struck-through items each
  with an `×` to permanently remove. This is what lets the list "continually
  shrink" through the week per the original ask, without silently losing data.
- Each card's items persist to Firestore keyed by `{ checklist_id, item_id, date }`
  so recurring items reset naturally at the top of a new week if desired — open
  decision, see below.

### Habit heatmaps (sidebar)
- Standard GitHub layout: **7 rows (Mon–Sun) × N columns (weeks)**, not 3×24 —
  the earlier 3-row version had no real meaning against "today." Today's cell
  gets an outline. Column count ~12 gives a rolling-quarter view; make configurable.

### Weather
- Sidebar mini-week: icon per day, click/hover opens a small popover with AM/PM
  temps for that day's **assigned city** (from `weekly.yml`).
- Sticky strip at the top of the main content area (all views, not just Week):
  compact AM/PM per weekday, sticks under the header on scroll. This replaces the
  larger forecast cards from mockup v1.
- Per-city, per-weekday fetch (KMA API or OpenWeatherMap free tier), cached —
  no need to refetch more than a few times a day.

### Month view — rolling 6-week window
- Not a calendar-month grid. Compute `gridStart = Sunday-of-current-week − 14
  days`, render 42 consecutive days from there. This keeps the current week
  anchored around row 3 of 6, with 2 weeks of lead-in and 3 weeks of lookahead,
  and lets the *next* month visibly ease into view as the current one ends —
  exactly as requested. Days outside the "focal" month get a dimmed background
  but keep their date number and any flags (not hidden).
- Day-number color coding: Sunday → red, Saturday → blue, KR/school holiday →
  red (from `holidays.yml`), make-up day → yellow (from `holidays.yml`).
- No default "teaching day" dot — weekdays are assumed to be teaching days.
  Dots/flags only appear for exceptions (schedule change, 2-class day) and are
  hover/click targets for detail, not decoration.
- Family hikes / church events come from `personal-events.yml` as a distinct
  flag color (green) from deadlines (pink) and 학회 (gold).
- **Google Calendar**: full OAuth + live API sync is probably overkill for a
  single-user personal dashboard and adds a real maintenance surface. A lighter
  middle path — if Google Calendar involvement is still wanted — is a **read-only
  ICS feed** (Google Calendar's "secret address in iCal format" under calendar
  settings): no OAuth, just a periodic fetch-and-parse of a plain ICS URL,
  merged into `personal-events.yml`'s data shape at render time. Recommend
  starting with `personal-events.yml` alone and only adding the ICS bridge if
  it turns out to be genuinely useful.

### Semester view — transposed, from `class-schedule.yml`
- Axes flipped from mockup v1: **columns = weekday/university, rows = week
  number**, so cells can hold actual lecture-title text (pulled from the
  `chapter`/`title`/`shortname` field in `class-schedule.yml`) instead of bare
  color squares.
- A day's cell can hold **two independently-colored sub-blocks** (AM/PM) when
  the weekday has two different classes/schools — e.g. a normal teaching day
  plus a guest lecture elsewhere. Same-school AM/PM just shows two lines in one
  color.
- Small linked logo/initial badge next to each university's column header,
  pointing at that school's portal.
- A dedicated **Deadlines / 학회** column at the right, one marker per week,
  `title=""` tooltip (swap for a proper tooltip component in the real build —
  native `title` is a mockup stand-in) with the full deadline text on hover.

### Footer
- Semester-long goals (small, e.g. "2 papers · KSPAI symposium organized"),
  synced source/date colophon line. Kept intentionally quiet — this is not
  where the "systems"/long-range material lives (that's the sidebar North Star
  accordion); the footer is just a light, always-visible progress reminder.

### Quote / verse
- Moved from footer (v1) to a slim banner directly under the header, above the
  sidebar+content grid. Rationale: it's morning-ritual content (pairs with the
  Bible-reading habit tracked in the sidebar) and reads better as something seen
  first, but kept as a single unobtrusive line rather than a hero element so it
  doesn't compete with the schedule.

## Open decisions (need Aaron's input before/while building)

**Resolved since the original write-up:**
1. ~~Real weekday → city/university mapping~~ — done, live in `_data/weekly.yml`
   + `_data/course-sources.yml`.
4. ~~ETF tracking~~ — real feature: live prices via Yahoo Finance, sidebar row
   with sparklines, `_data/etfs.yml`.
6. ~~Working title~~ — "Compass" stuck; 🧭 is the brand mark (swappable for a
   real logo via `_data/branding.yml`).

**Still open:**
2. **Recurring checklist items**: should "Grading" / "Prep" items reset weekly
   (pulling fresh from the YAML template each Monday) or persist indefinitely
   until manually removed? Affects whether checklist items are keyed by
   `{item_id}` alone or `{item_id, week}`. Current behavior: persist
   indefinitely (no reset logic built).
3. **Google Calendar**: skip entirely, or add the read-only ICS bridge described
   above? Recommend deciding after using `personal-events.yml` manually for a
   few weeks. (`personal-events.yml` now supports multi-day spans via
   `end_date`, which covers more of what Calendar might have been for.)
5. **Habit heatmap window length** — mockup uses 12 weeks; confirm whether a
   semester-length (~16 weeks) or rolling-quarter window is more useful.
   Current: still 12 weeks, unchanged.

## Build order (phased, so this doesn't become its own procrastination trap)

1. Week view + sticky weather strip + habit sidebar (heatmaps + latest-value
   stats), static/local data only.
2. Ticket drawer with the inline-capture → collapse-to-chip interaction; wire to
   Firestore.
3. To-Do view: generic checklist card component, file-driven from
   `checklists/*.yml`.
4. Month view with the rolling 6-week window + holiday/make-up/event coloring.
5. Semester view pulling real data from `courses.aaron.kr`'s `class-schedule.yml`
   via the GitHub raw fetch.
6. Firebase Auth wiring (reuse existing setup) gating the whole app.
7. Goal-list accordions (North Star, optionally ETFs) from `goal-lists/*.yml`.

## Non-goals (for now)

- Native mobile app (Play/App Store) — explicitly a "maybe later" idea. Next.js
  + React knowledge transfers directly to Expo/React Native if this direction is
  ever pursued, but v1 is web-only.
- Live Google Calendar OAuth sync — see "Open decisions" above.
- Muscle-measurement tracking (Fitbod already covers this well; out of scope by
  design, per the original ask).
