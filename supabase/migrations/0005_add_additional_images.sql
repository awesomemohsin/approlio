-- Migration: Add additional_images column to posts table to support multi-image/album posts
alter table public.posts add column if not exists additional_images text[] default '{}'::text[];
