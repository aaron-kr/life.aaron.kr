# Deploy walkthrough

This is a from-scratch setup guide, written for coming back to this after time
away. Follow it top to bottom the first time; after that, only "Everyday
editing" and "Updating the live site" matter.

## 1. Firebase project (auth + database)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) →
   **Add project**. Name it anything (e.g. `life-aaron-kr`). Google Analytics
   is optional — skip it, this app doesn't use it.
2. **Add an app** → the `</>` (web) icon. Register it (nickname doesn't
   matter, no need to set up Firebase Hosting). You'll land on a config
   screen — copy the `firebaseConfig` object values into your local
   `.env.local` in a moment (step 4).
3. **Authentication** (left sidebar) → **Get started** → enable the **Google**
   sign-in provider. You don't need to configure anything else on that
   screen.
4. **Firestore Database** (left sidebar) → **Create database** → start in
   **production mode** (not test mode — the rules file below locks it down
   properly) → pick any region close to you.
5. Once created, go to the **Rules** tab and paste in the contents of
   [`firestore.rules`](firestore.rules) from this repo, replacing
   `YOUR_EMAIL` with your actual Google account email (the one you'll sign in
   with). **Publish.**

   ⚠️ `firestore.rules` in this repo is a *template* — pushing a code change
   to it does **not** update your live rules. Whenever a new Firestore
   collection is added here (check `git log -- firestore.rules`), re-paste
   the updated file into the console's Rules tab and Publish again, or writes
   to that collection will fail with "Missing or insufficient permissions."

This is the same pattern used by `courses.aaron.kr/attend` — a single-user
app where every collection is gated to one email address, both client-side
(the sign-in screen rejects other accounts) and server-side (Firestore rules
reject them too, so gating isn't just cosmetic).

## 2. Local environment

```bash
npm install
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

- `NEXT_PUBLIC_FIREBASE_*` — from the Firebase config screen in step 1.2
  (Project Settings → Your apps → SDK setup and configuration, if you closed
  that screen already).
- `NEXT_PUBLIC_ALLOWED_EMAIL` — your Google account email. Must exactly match
  what you put in `firestore.rules`.
- `OPENWEATHER_API_KEY` — optional. Free key at
  [openweathermap.org/api](https://openweathermap.org/api) (the "Current
  Weather Data" / free tier is enough — the app uses the 5-day/3-hour
  forecast endpoint, which is included). Without this, weather widgets show
  `—` instead of crashing.
- Course schedule sources aren't env vars — see `_data/course-sources.yml` in
  the table below.

`.env.local` is gitignored — it never gets committed, and Vercel doesn't read
it (see step 4).

## 3. Run it

```bash
npm run dev
```

Open `http://localhost:3000`. First run: **Set up Firebase first** screen
means one of the `NEXT_PUBLIC_FIREBASE_*` values is still blank — double
check step 2. Otherwise you'll land on **Sign in with Google** — sign in with
the account you allow-listed. The dashboard has live reloading: edit any file
under `app/`, `components/`, `lib/`, or `_data/` and the browser updates
automatically without a manual refresh.

## 4. Deploy to Vercel

1. Push this repo to GitHub if it isn't already (`git remote -v` — it's
   already pointed at `aaron-kr/life.aaron.kr`).
2. [vercel.com/new](https://vercel.com/new) → import the repo. Framework
   preset auto-detects as Next.js — no build settings to change.
3. Before the first deploy (or right after, then redeploy), go to
   **Settings → Environment Variables** and add every key from
   `.env.local.example` with your real values — same ones as step 2. Vercel
   never reads `.env.local` (it's gitignored), so this step is required even
   though it feels redundant.
4. Deploy. Add your custom domain (`life.aaron.kr`) under **Settings →
   Domains** and point its DNS at Vercel per their instructions.

## Everyday editing

Most changes don't touch code at all:

| Want to change... | Edit this file |
|---|---|
| Weekly schedule blocks, weekday→city map, block colors | `_data/weekly.yml` |
| Holidays / make-up days | `_data/holidays.yml` |
| Family events, deadlines, conferences, multi-day trips | `_data/personal-events.yml` |
| Daily quote rotation | `_data/quotes.yml` |
| Bible reading plan | `_data/bible-plan.yml` |
| Top stats strip (what's tracked, units, goals, order) | `_data/stats/*.yml` — one file per stat |
| Habit heatmaps (what's tracked) | `_data/habits.yml` |
| Recurring ticket routes | `_data/tickets.yml` |
| ETF watchlist (live-priced) | `_data/etfs.yml` |
| North Star / PAI Lab goals | `_data/goal-lists/*.yml` |
| Courses, weekdays, university, colors, course webpage link | `_data/course-sources.yml` |
| Hometown weather/time widget | `_data/hometown.yml` |
| Business/tax filing reminders | `_data/business-deadlines.yml` |
| Compass logo (replaces the 🧭 emoji) | `_data/branding.yml` |
| Weather hero background images | `public/images/weather/` (see its README) |
| Top-band background image | `public/images/hero/` (see its README) |

**Editing convention**: in date-listy files (`holidays.yml`, `personal-events.yml`), newest-first is just a convention for your own sake — nothing in the code reads or depends on file order, add entries wherever's convenient. `bible-plan.yml` is the one exception: it's keyed by calendar day (`MM-DD`), not entry date, so keep it in month-day order instead.

**Weekly schedule blocks** (`_data/weekly.yml`) support a few optional per-block fields: `color` (a CSS var name like `"--pink"`, overriding the `type`'s default palette color), `university` (a courses.aaron.kr `universities.yml` abbr, which puts that school's logo inline in the block and links it to the portal), and `day` accepts `saturday`/`sunday` too, not just weekdays — the grid runs Sun→Sat. Row height and block height are both driven by one constant (`SLOT_H` in `components/views/WeekView.tsx`) — if you ever want taller/shorter rows, that's the only number to change; there's no separate CSS value to keep in sync.

`_data/course-sources.yml` is the hub for anything school-related: each entry
declares a course's `label`, `weekday`, `university` (an `abbr` key from
courses.aaron.kr's shared `universities.yml`, fetched live — logos and portal
links come from there automatically), `color`, optionally a `url` to that
course's lecture YAML, and optionally a `page_url` — the course's own webpage
on courses.aaron.kr, which the Semester view links every title/header to when
set. A course shows up in the Month view header and the weather hero's school
badge as soon as `weekday`+`university` are set — the `url` only affects
whether the Semester view's column has actual lecture rows in it yet.
`semester_start` (top-level, one date) is the Monday that "week 1" aligns to
for every course's row in the Semester view.

### Universities.yml: what's automatic vs. what you update yourself

`_data/course-sources.yml` is **not** the university directory — it just
references one by `abbr`. The actual names/logos/portal links are fetched
live every hour from courses.aaron.kr's `_data/universities.yml`
(`lib/universities.ts`). That means:

- **Automatic, no action needed**: adding a new school to courses.aaron.kr's
  `universities.yml`, or changing a logo/portal URL there, shows up here on
  its own (within the hour, or immediately on next deploy).
- **Manual, every semester**: `_data/course-sources.yml` in *this* repo still
  needs hand-editing — it's the list of which courses you're actually
  teaching this semester, on which weekday, with which color, and (once you
  have it) which raw lecture-file URL. Nothing pulls that automatically,
  since only you know which courses you're teaching.

Add a new file to `_data/checklists/` and it shows up as a new card in the
To-Do view automatically — no code change. Give it a `group:` field (see the
5 school-admin checklists for an example) to cluster it under its own row
heading instead of "General", and a `university:` (abbr) field to show that
school's logo on the card. Same file-drop pattern for `_data/goal-lists/`
(sidebar accordions) and `_data/stats/` (top strip cards).

Both `_data/stats/*.yml` and `_data/checklists/*.yml` support an `order:`
number for controlling display order yourself instead of alphabetical-by-
filename — lower sorts first, ties/unset fall back to file order, numbers are
spaced by 10 so you can slot new ones in between without renumbering
everything (see any existing stat or the school checklists for examples).

None of these need a Firebase touch — only the *state* you check off (habit
checkins, stat entries, checklist done-state, ticket purchases, ETF prices
are fetched live rather than stored at all) lives in Firestore. The
declarations above are just YAML, committed to git like any other file.

### How the quote banner and Bible reading plan work

The quote is picked deterministically by day-of-year (`quotes[dayOfYear() %
quotes.length]`), so it changes once a day automatically and is the same for
every visit that day, cycling back to the start once it runs past the end of
`quotes.yml`. The ‹ › arrows just let you browse other quotes in the list for
your own viewing — they don't change what "today's" quote is, or affect the
Bible reading, which is looked up separately by today's `MM-DD` in
`bible-plan.yml` (no year, so the same file works indefinitely; Feb 29 falls
back to Feb 28 automatically). `bible-plan.yml` ships with just 3 placeholder
days — Claude didn't have a full reading plan memorized reliably enough to
fill in all 365+ days without risking a wrong reference, so add your own
(M'Cheyne, chronological, whatever you're using).

## Updating the live site

Push to `main` (or whatever branch Vercel is tracking) — it redeploys
automatically. Since `_data/*.yml` is read at request time (not baked into a
static export image, though pages themselves are cached with a 1-hour
revalidate window), editing a YAML file and pushing is enough; no manual
cache-bust needed beyond that hour.

## Future enhancements (not built yet)

- **Weather hero images** — `public/images/weather/` ships empty; the hero
  falls back to a plain gradient until you upload images (see that folder's
  README for the exact filenames it looks for).
- **Google Calendar ICS bridge** — intentionally skipped per `CLAUDE.md`;
  `personal-events.yml` covers this for now.
- **Business view dates** — `_data/business-deadlines.yml` was seeded from
  general/commonly-known deadlines, not verified against your specific
  사업자등록 type or personal situation. Confirm with your 세무사/accountant
  before relying on it, especially the KR VAT schedule and anything
  PFIC-related.
- **Business view scope** — currently just a static reminder list. If you
  want it to do more (track filed/not-filed state, link to actual forms),
  that's a bigger lift than this pass — say so and it can grow into a real
  checklist like the To-Do view's.

## Third-party data sources this app depends on

None of these need a key, but all are informal/unofficial endpoints that
could change or go away — noting them here so a future "why did X stop
working" debugging session starts in the right place:

| Feature | Source | Notes |
|---|---|---|
| Weather | OpenWeatherMap forecast API | Needs `OPENWEATHER_API_KEY` (free tier) — the one official, documented dependency here |
| ETF prices | Yahoo Finance's unofficial chart endpoint (`query1.finance.yahoo.com`) | No key. Stooq's CSV export was the original choice but now sits behind a JS bot-verification challenge a server fetch can't pass — see `app/api/stock/route.ts` |
| University directory | courses.aaron.kr's `universities.yml` via raw GitHub | Yours, so unlikely to break, but a path/rename there needs a matching update in `lib/universities.ts` |
| University logos | Cloudinary URLs referenced in `universities.yml` | Rendered `unoptimized` (no Next Image proxy), so any hotlink protection changes there would show as broken logo icons |
