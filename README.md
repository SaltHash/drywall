# Drywall Clicker

## Overview
Drywall clicker is a bit of a meme clicker game that I've developed over the past few months. I don't know where this game will go, so don't get too attached or anything :)
Backend built (somewhat) securely with Neon and my beloved Cloudflare workers.

## Project layout

| Path | Purpose |
| --- | --- |
| `index.html`, `styles/`, `assets/` | Static game client |
| `scripts/` | Client-side game logic (ES modules) |
| `scripts/config/version.js` | Single source of truth for the game version |
| `scripts/services/leaderboard.js` | Client for the Worker API |
| `src/index.js` | Cloudflare Worker: static assets + `/api/*` |
| `db/schema.sql` | Neon schema (one row per player, stats in JSON) |
| `db/migrate.mjs` | Applies the schema |
| `test/api.smoke.mjs` | End-to-end API smoke test |

## Backend setup

The database connection string lives in `.env` as `DATABASE_URL` (never commit
it — `.env` is gitignored). Copy `.env.example` to get started.

```bash
npm install
npm run db:migrate     # create/refresh the Neon schema
npm run dev            # wrangler dev on http://localhost:8787 (reads .env)
npm run db:smoke       # end-to-end API smoke test against the real database
```

Requires Node 20.6 or newer (for `node --env-file`).

For production, store the connection string as a Worker secret and deploy:

```bash
npx wrangler secret put DATABASE_URL   # paste the Neon connection string
npm run deploy                          # wrangler deploy (assets + API)
```

## API

| Route | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/leaderboard` | GET | none | Public projection: display name + stats only |
| `/api/connect` | POST | secret key | Returns the full private save for a secret |
| `/api/sync` | POST | secret key | Creates/updates the caller's row |

Every player is one row. All of their stats live in a single `save` JSON
document, so new stats never require a schema change. The secret key is
SHA-256-hashed before storage and the browser never sees `DATABASE_URL`.

## Releasing

Bump `GAME_VERSION` in `scripts/config/version.js` — the title screen and the
event-badge gating both read it — and keep the `version` in `package.json` in
step. Add a matching entry to the changelogs in `index.html` and above.

Limited-time event badges (Alpha/Beta Tester) stop being awarded automatically
once `GAME_VERSION` moves past the version they closed at, so no further code
change is required.

# Stats
There are currently:
- 8 areas with 24 buttons
- 33 skill tree upgrades
- 29 infinity tree upgrades
- 6 generator upgrades

# Update Log
v0.3.0
- Finished the skill tree
- Balancing changes
- Small changes/additions like the 4 rebirths button

v0.4.0
- Created this changelog :)
- Added Infinity: Infinity Milestones, Infinity Points, and Infinity Power
- Added global messaging system
- 2 new settings (fixed Dark Mode)
- Added infinity leaderboard
- Small improvements and additions
- Bugfixes

v0.5.0 (migrated changelog to game)
- Most notably added break infinity
- Added achievments
- Improved leaderboards

v0.5.4
- Leaderboard dropdown selection
- Reworked how leaderboards are stored and served

v1.0.0
- Cloud saves: progress syncs across devices via a secret key
- Leaderboard opt-in with a player-chosen display name
- Leaderboard dropdown covering every tracked stat
- New backend: Cloudflare Worker API on Neon Postgres (replaces Supabase)
