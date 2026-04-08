-- Drywall leaderboard database schema (Supabase/PostgreSQL)
-- Centralized bootstrap script for creating the database from scratch.

begin;

create extension if not exists pgcrypto;

create table if not exists public.leaderboard_profiles (
  id text primary key,
  display_name text not null,
  edit_key text not null,
  scores jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leaderboard_profiles_edit_key_len check (char_length(edit_key) >= 24)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_leaderboard_profiles_updated_at on public.leaderboard_profiles;
create trigger trg_leaderboard_profiles_updated_at
before update on public.leaderboard_profiles
for each row
execute function public.set_updated_at();

create index if not exists leaderboard_profiles_id_edit_key_idx
  on public.leaderboard_profiles (id, edit_key);

create index if not exists leaderboard_profiles_updated_at_idx
  on public.leaderboard_profiles (updated_at desc);

alter table public.leaderboard_profiles enable row level security;

revoke all on table public.leaderboard_profiles from anon, authenticated;
revoke select (edit_key) on public.leaderboard_profiles from anon, authenticated;

create or replace function public.load_leaderboard()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_object_agg(
      p.id,
      jsonb_build_object(
        'display_name', p.display_name,
        'scores', p.scores
      )
    ),
    '{}'::jsonb
  )
  from public.leaderboard_profiles p;
$$;

create or replace function public.save_scores(
  p_id text,
  p_edit_key text,
  p_scores jsonb,
  p_display_name text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_id is null or btrim(p_id) = '' then
    raise exception 'invalid id';
  end if;

  if p_edit_key is null or char_length(p_edit_key) < 24 then
    raise exception 'invalid edit key';
  end if;

  insert into public.leaderboard_profiles as p (id, display_name, edit_key, scores)
  values (
    p_id,
    coalesce(nullif(btrim(p_display_name), ''), p_id),
    p_edit_key,
    coalesce(p_scores, '{}'::jsonb)
  )
  on conflict (id) do update
    set scores = excluded.scores,
        display_name = coalesce(nullif(btrim(excluded.display_name), ''), p.display_name)
  where p.edit_key = excluded.edit_key;
end;
$$;

grant execute on function public.load_leaderboard() to anon, authenticated;
grant execute on function public.save_scores(text, text, jsonb, text) to anon, authenticated;

grant usage on schema public to anon, authenticated;

commit;
