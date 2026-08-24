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
- `CLASS_SCHEDULE_URL` — leave as-is. It points at a file that doesn't exist
  in `courses.aaron.kr` yet; the Semester view shows a friendly empty state
  until it does.

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
| Sidebar stats (what's tracked, units, goals) | `_data/stats.yml` |
| Habit heatmaps (what's tracked) | `_data/habits.yml` |
| Recurring ticket routes | `_data/tickets.yml` |
| ETF watchlist prices | `_data/goal-lists/etfs.yml` |
| North Star goals | `_data/goal-lists/north-star.yml` |

Add a new file to `_data/checklists/` and it shows up as a new card in the
To-Do view automatically — no code change. Same for `_data/goal-lists/` and
the sidebar accordions.

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
- **class-schedule.yml** — the Semester view is fully wired but has nothing
  to read until that file exists in the `courses.aaron.kr` repo (see
  `CLASS_SCHEDULE_URL` in `.env.local.example` for the expected shape: a
  `days` list and a `weeks` list — see `lib/types.ts`'s `ClassSchedule` type).
- **Google Calendar ICS bridge** — intentionally skipped per `CLAUDE.md`;
  `personal-events.yml` covers this for now.
