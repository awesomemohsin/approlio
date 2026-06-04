-- Migration: Scope unique constraints by profile_id to allow duplicates across profiles

-- 1. Update unique constraint on public.sources
alter table public.sources drop constraint if exists sources_url_unique;
alter table public.sources add constraint sources_profile_platform_url_unique unique (profile_id, platform, url);

-- 2. Update unique constraint on public.posts
alter table public.posts drop constraint if exists posts_source_post_id_unique;
alter table public.posts add constraint posts_profile_source_post_id_unique unique (profile_id, source_post_id);

-- 3. Update unique constraint on public.connections
alter table public.connections drop constraint if exists connections_platform_platform_id_unique;
alter table public.connections add constraint connections_profile_platform_platform_id_unique unique (profile_id, platform, platform_id);
