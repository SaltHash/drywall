-- Suggested migration for secure client-managed edit keys.
-- NOTE: Replace `leaderboard_profiles` with your actual table name if different.

begin;

-- 1) Ensure edit_key is present, long enough, and never null.
alter table if exists public.leaderboard_profiles
  add column if not exists edit_key text;

-- Keep existing rows valid while moving ownership of key generation to client.
update public.leaderboard_profiles
set edit_key = coalesce(nullif(edit_key, ''), encode(gen_random_bytes(32), 'hex'))
where edit_key is null or edit_key = '';

alter table if exists public.leaderboard_profiles
  alter column edit_key set not null;

alter table if exists public.leaderboard_profiles
  add constraint leaderboard_profiles_edit_key_len
  check (char_length(edit_key) >= 24);

-- 2) Fast auth checks for upserts guarded by id + edit_key.
create index if not exists leaderboard_profiles_id_edit_key_idx
  on public.leaderboard_profiles (id, edit_key);

-- 3) Prevent accidental exposure to public readers.
revoke select (edit_key) on public.leaderboard_profiles from anon, authenticated;

-- 4) Replace leaderboard reader RPC with a safe projection that excludes edit_key.
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

-- 5) Save RPC: key is required to update an existing profile.
create or replace function public.save_scores(
  p_id text,
  p_edit_key text,
  p_scores jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_id is null or p_edit_key is null or char_length(p_edit_key) < 24 then
    raise exception 'invalid id/edit key';
  end if;

  insert into public.leaderboard_profiles as p (id, edit_key, scores)
  values (p_id, p_edit_key, p_scores)
  on conflict (id) do update
    set scores = excluded.scores,
        updated_at = now()
  where p.edit_key = excluded.edit_key;
end;
$$;

commit;
