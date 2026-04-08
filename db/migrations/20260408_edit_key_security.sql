-- Edit key security migration for leaderboard profile edits.
-- NOTE: Review table/function names against your current schema before executing.

-- 1) Ensure edit_key exists and is client-supplied (server no longer auto-generates it).
alter table if exists public.leaderboard
  add column if not exists edit_key text;

-- 2) Enforce shape/entropy minimums at the DB boundary.
alter table if exists public.leaderboard
  add constraint leaderboard_edit_key_length_chk
  check (char_length(edit_key) >= 32);

-- 3) Ensure no two profiles share the same edit key.
create unique index if not exists leaderboard_edit_key_unique_idx
  on public.leaderboard (edit_key);

-- 4) Optional hardening: store only a hash of edit key (recommended).
--    If you enable this section, update client/server to send raw key for verify
--    and only persist the digest.
-- create extension if not exists pgcrypto;
-- alter table public.leaderboard add column if not exists edit_key_hash text;
-- update public.leaderboard
--   set edit_key_hash = encode(digest(edit_key, 'sha256'), 'hex')
-- where edit_key is not null and edit_key_hash is null;
-- alter table public.leaderboard alter column edit_key_hash set not null;
-- alter table public.leaderboard drop column edit_key;

-- 5) Example secure upsert function using supplied edit key.
create or replace function public.submit_leaderboard(
  p_key text,
  p_edit_key text,
  p_display_name text,
  p_drywall text,
  p_rebirths text,
  p_skill_points text,
  p_infinities text,
  p_achievements integer
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_edit_key is null or char_length(p_edit_key) < 32 then
    raise exception 'Invalid edit key';
  end if;

  insert into public.leaderboard (
    key,
    edit_key,
    display_name,
    drywall,
    rebirths,
    skill_points,
    infinities,
    achievements,
    updated_at
  ) values (
    p_key,
    p_edit_key,
    p_display_name,
    p_drywall,
    p_rebirths,
    p_skill_points,
    p_infinities,
    p_achievements,
    now()
  )
  on conflict (key)
  do update
    set display_name = excluded.display_name,
        drywall = excluded.drywall,
        rebirths = excluded.rebirths,
        skill_points = excluded.skill_points,
        infinities = excluded.infinities,
        achievements = excluded.achievements,
        updated_at = now()
  where public.leaderboard.edit_key = p_edit_key;

  -- If key exists but edit key mismatches, fail closed.
  if not found then
    raise exception 'Edit key mismatch for this leaderboard profile';
  end if;
end;
$$;
