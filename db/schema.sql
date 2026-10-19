-- Drywall backend schema (Neon Postgres).
--
-- Design notes
-- ------------
--   * One row per player. Every player stat lives inside the `save` JSON
--     document (the whole client save object), so adding brand-new stats in
--     later versions requires no schema migration.
--   * `stats` is a server-derived, *public* projection of `save` used for the
--     leaderboards. It never contains the full save (or the secret).
--   * Credentials are never stored in plaintext: the client's secret key is
--     hashed (SHA-256) by the Worker before it reaches the database, and only
--     the hash is kept. This means a database leak does not expose any secret.
--   * The browser never talks to this database directly; only the Worker does.
--     There is therefore no need for Row Level Security or PostgREST grants.

create table if not exists public.players (
  id              text        primary key,
  display_name    text        not null,
  secret_hash     text        not null,
  stats           jsonb       not null default '{}'::jsonb,
  save            jsonb       not null default '{}'::jsonb,
  save_updated_at bigint      not null default 0,
  -- Whether this player wants to appear on the public leaderboards. Players
  -- who skipped the username prompt stay `false` until they opt in.
  leaderboard_opt_in boolean  not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint players_id_format           check (id ~ '^[A-Za-z0-9_-]{8,64}$'),
  constraint players_display_name_length check (char_length(display_name) between 1 and 20),
  constraint players_secret_hash_format  check (secret_hash ~ '^[0-9a-f]{64}$'),
  constraint players_save_updated_nonneg check (save_updated_at >= 0)
);

-- Backfill the column for databases created before opt-in existed.
alter table public.players
  add column if not exists leaderboard_opt_in boolean not null default false;

-- A secret key may only ever be linked to a single player row.
create unique index if not exists players_secret_hash_uidx
  on public.players (secret_hash);

-- Supports the "most recently active" ordering used by the API.
create index if not exists players_updated_at_idx
  on public.players (updated_at desc);

-- Only opted-in players are ever read by the public leaderboard.
create index if not exists players_leaderboard_opt_in_idx
  on public.players (leaderboard_opt_in)
  where leaderboard_opt_in;
