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
| Weekly schedule blocks, weekday→city map | `_data/dashboard-template.yml` |
| Holidays / make-up days | `_data/holidays.yml` |
| Family events, deadlines, conferences | `_data/personal-events.yml` |
| Daily quote rotation | `_data/quotes.yml` |
| Top stats strip (what's tracked, units, goals) | `_data/stats/*.yml` — one file per stat |
| Habit heatmaps (what's tracked) | `_data/habits.yml` |
| Recurring ticket routes | `_data/tickets.yml` |
| ETF watchlist prices | `_data/goal-lists/etfs.yml` |
| North Star / PAI Lab goals | `_data/goal-lists/*.yml` |
| Courses, weekdays, university, colors (Semester + Month view + weather logo) | `_data/course-sources.yml` |
| Hometown weather/time widget | `_data/hometown.yml` |
| Weather hero background images | `public/images/weather/` (see its README) |
| Top-band background image | `public/images/hero/` (see its README) |

`_data/course-sources.yml` is the hub for anything school-related: each entry
declares a course's `label`, `weekday`, `university` (an `abbr` key from
courses.aaron.kr's shared `universities.yml`, fetched live — logos and portal
links come from there automatically), `color`, and optionally a `url` to that
course's lecture YAML. A course shows up in the Month view header and the
weather hero's school badge as soon as `weekday`+`university` are set — the
`url` only affects whether the Semester view's column has actual lecture rows
in it yet. `semester_start` (top-level, one date) is the Monday that "week 1"
aligns to for every course's row in the Semester view.

Add a new file to `_data/checklists/` and it shows up as a new card in the
To-Do view automatically — no code change. Give it a `group:` field (see the
5 school-admin checklists for an example) to cluster it under its own row
heading instead of "General". Same file-drop pattern for `_data/goal-lists/`
(sidebar accordions) and `_data/stats/` (top strip cards).

None of these need a Firebase touch — only the *state* you check off (habit
checkins, stat entries, checklist done-state, ticket purchases) lives in
Firestore. The declarations above are just YAML, committed to git like any
other file.

## Updating the live site

Push to `main` (or whatever branch Vercel is tracking) — it redeploys
automatically. Since `_data/*.yml` is read at request time (not baked into a
static export image, though pages themselves are cached with a 1-hour
revalidate window), editing a YAML file and pushing is enough; no manual
cache-bust needed beyond that hour.

## Future enhancements (not built yet)

- **Live ETF prices** — `_data/goal-lists/etfs.yml` is manually edited for
  now. A real feed would need a stock-price API route similar to
  `app/api/weather/route.ts`.
- **Weather hero images** — `public/images/weather/` ships empty; the hero
  falls back to a plain gradient until you upload images (see that folder's
  README for the exact filenames it looks for).
- **Google Calendar ICS bridge** — intentionally skipped per `CLAUDE.md`;
  `personal-events.yml` covers this for now.
