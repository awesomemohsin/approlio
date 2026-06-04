-- Migration: Multi-profile / Multi-workspace support

-- 1. Create Profiles table
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
drop policy if exists "Authenticated admins can read profiles" on public.profiles;
create policy "Authenticated admins can read profiles"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Authenticated admins can write profiles" on public.profiles;
create policy "Authenticated admins can write profiles"
  on public.profiles for all
  to authenticated
  using (true)
  with check (true);

-- Add to realtime
alter publication supabase_realtime add table public.profiles;

-- 2. Migrations for existing tables (scoping to profiles)
do $$
declare
  default_profile_id uuid;
begin
  -- Ensure at least one profile exists
  if not exists (select 1 from public.profiles) then
    insert into public.profiles (name)
    values ('TEST')
    returning id into default_profile_id;
  else
    select id into default_profile_id from public.profiles limit 1;
  end if;

  -- Add profile_id to sources
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'sources' and column_name = 'profile_id') then
    alter table public.sources add column profile_id uuid references public.profiles(id) on delete cascade;
    update public.sources set profile_id = default_profile_id;
    alter table public.sources alter column profile_id set not null;
  end if;

  -- Add profile_id to posts
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'posts' and column_name = 'profile_id') then
    alter table public.posts add column profile_id uuid references public.profiles(id) on delete cascade;
    update public.posts set profile_id = default_profile_id;
    alter table public.posts alter column profile_id set not null;
  end if;

  -- Add profile_id to connections
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'connections' and column_name = 'profile_id') then
    alter table public.connections add column profile_id uuid references public.profiles(id) on delete cascade;
    update public.connections set profile_id = default_profile_id;
    alter table public.connections alter column profile_id set not null;
  end if;

  -- Add profile_id to settings
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'settings' and column_name = 'profile_id') then
    alter table public.settings drop constraint if exists settings_pkey;
    alter table public.settings add column profile_id uuid references public.profiles(id) on delete cascade;
    update public.settings set profile_id = default_profile_id;
    alter table public.settings alter column profile_id set not null;
    alter table public.settings add primary key (profile_id, key);
  end if;
end $$;

-- 3. Populate default settings for all profiles
insert into public.settings (profile_id, key, value)
select id, 'ask_for_destination_on_approval', 'true'::jsonb
from public.profiles
on conflict (profile_id, key) do nothing;
