create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'source_platform') then
    create type public.source_platform as enum ('facebook', 'youtube', 'tiktok', 'rss', 'website');
  end if;

  if not exists (select 1 from pg_type where typname = 'post_status') then
    create type public.post_status as enum ('pending', 'approved', 'posted', 'rejected', 'failed');
  end if;
end $$;

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  platform public.source_platform not null,
  url text not null,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint sources_url_unique unique (platform, url)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete set null,
  source_post_id text not null,
  source_url text not null,
  platform public.source_platform not null,
  thumbnail_url text,
  video_url text,
  original_caption text,
  edited_caption text,
  status public.post_status not null default 'pending',
  source_published_at timestamptz,
  published_at timestamptz,
  published_response jsonb,
  telegram_message_id bigint,
  retry_count integer not null default 0,
  next_retry_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  constraint posts_source_post_id_unique unique (source_post_id),
  constraint posts_retry_count_non_negative check (retry_count >= 0)
);

create index if not exists posts_status_created_at_idx on public.posts(status, created_at desc);
create index if not exists posts_platform_created_at_idx on public.posts(platform, created_at desc);
create index if not exists posts_source_id_idx on public.posts(source_id);
create index if not exists posts_search_idx on public.posts using gin (
  to_tsvector('english', coalesce(original_caption, '') || ' ' || coalesce(edited_caption, '') || ' ' || source_url)
);

create table if not exists public.publish_logs (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete set null,
  action text not null default 'event',
  status text not null,
  response jsonb not null default '{}'::jsonb,
  actor text not null default 'system',
  created_at timestamptz not null default now()
);

create index if not exists publish_logs_post_created_idx on public.publish_logs(post_id, created_at desc);
create index if not exists publish_logs_status_created_idx on public.publish_logs(status, created_at desc);

alter table public.sources enable row level security;
alter table public.posts enable row level security;
alter table public.publish_logs enable row level security;

drop policy if exists "Authenticated admins can read sources" on public.sources;
create policy "Authenticated admins can read sources"
  on public.sources for select
  to authenticated
  using (true);

drop policy if exists "Authenticated admins can write sources" on public.sources;
create policy "Authenticated admins can write sources"
  on public.sources for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admins can read posts" on public.posts;
create policy "Authenticated admins can read posts"
  on public.posts for select
  to authenticated
  using (true);

drop policy if exists "Authenticated admins can write posts" on public.posts;
create policy "Authenticated admins can write posts"
  on public.posts for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admins can read publish logs" on public.publish_logs;
create policy "Authenticated admins can read publish logs"
  on public.publish_logs for select
  to authenticated
  using (true);

drop policy if exists "Authenticated admins can write publish logs" on public.publish_logs;
create policy "Authenticated admins can write publish logs"
  on public.publish_logs for insert
  to authenticated
  with check (true);

alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.sources;
alter publication supabase_realtime add table public.publish_logs;
