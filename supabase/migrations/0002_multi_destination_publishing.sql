-- Migration: Multi-destination publishing support (Facebook pages and YouTube channels)

-- 1. Connections Table (Stores official OAuth details)
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  platform public.source_platform not null,
  type text not null, -- e.g., 'facebook_page', 'youtube_channel'
  platform_id text not null, -- e.g., Page ID or Channel ID
  token_data jsonb not null default '{}'::jsonb, -- stores access_token, refresh_token, page_access_token, token expiration/meta details
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint connections_platform_platform_id_unique unique (platform, platform_id)
);

-- 2. Post Destinations Table (Maps pending/posted items to specific connection channels)
create table if not exists public.post_destinations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  connection_id uuid not null references public.connections(id) on delete cascade,
  status public.post_status not null default 'pending',
  published_at timestamptz,
  published_response jsonb,
  last_error text,
  created_at timestamptz not null default now(),
  constraint post_destinations_post_connection_unique unique (post_id, connection_id)
);

-- 3. Settings Table (Stores user settings like prompt_for_destination_on_approval)
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security (RLS) policies
alter table public.connections enable row level security;
alter table public.post_destinations enable row level security;
alter table public.settings enable row level security;

-- Policies for connections
drop policy if exists "Authenticated admins can read connections" on public.connections;
create policy "Authenticated admins can read connections"
  on public.connections for select
  to authenticated
  using (true);

drop policy if exists "Authenticated admins can write connections" on public.connections;
create policy "Authenticated admins can write connections"
  on public.connections for all
  to authenticated
  using (true)
  with check (true);

-- Policies for post_destinations
drop policy if exists "Authenticated admins can read post_destinations" on public.post_destinations;
create policy "Authenticated admins can read post_destinations"
  on public.post_destinations for select
  to authenticated
  using (true);

drop policy if exists "Authenticated admins can write post_destinations" on public.post_destinations;
create policy "Authenticated admins can write post_destinations"
  on public.post_destinations for all
  to authenticated
  using (true)
  with check (true);

-- Policies for settings
drop policy if exists "Authenticated admins can read settings" on public.settings;
create policy "Authenticated admins can read settings"
  on public.settings for select
  to authenticated
  using (true);

drop policy if exists "Authenticated admins can write settings" on public.settings;
create policy "Authenticated admins can write settings"
  on public.settings for all
  to authenticated
  using (true)
  with check (true);

-- Add to supabase realtime publication
alter publication supabase_realtime add table public.connections;
alter publication supabase_realtime add table public.post_destinations;

-- Insert default setting
insert into public.settings (key, value)
values ('ask_for_destination_on_approval', 'true'::jsonb)
on conflict (key) do nothing;
