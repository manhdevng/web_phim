-- Phase 2 user features for Lumiere Cinema.
-- Run this in the Supabase SQL Editor if these tables, constraints, or policies are missing.

create extension if not exists pgcrypto;

create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id text not null references public.movies(id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index if not exists watchlists_user_movie_idx
  on public.watchlists(user_id, movie_id);

create table if not exists public.watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id text not null references public.movies(id) on delete cascade,
  progress_seconds integer not null default 0,
  last_watched_at timestamptz not null default now()
);

create unique index if not exists watch_history_user_movie_idx
  on public.watch_history(user_id, movie_id);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  movie_id text not null references public.movies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 1000),
  is_admin boolean not null default false,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists comments_movie_created_idx
  on public.comments(movie_id, is_pinned desc, created_at desc);

alter table public.watchlists enable row level security;
alter table public.watch_history enable row level security;
alter table public.comments enable row level security;

drop policy if exists "Watchlists are readable by owner" on public.watchlists;
create policy "Watchlists are readable by owner"
  on public.watchlists for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own watchlist rows" on public.watchlists;
create policy "Users can insert own watchlist rows"
  on public.watchlists for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own watchlist rows" on public.watchlists;
create policy "Users can delete own watchlist rows"
  on public.watchlists for delete
  using (auth.uid() = user_id);

drop policy if exists "Watch history is readable by owner" on public.watch_history;
create policy "Watch history is readable by owner"
  on public.watch_history for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own watch history" on public.watch_history;
create policy "Users can insert own watch history"
  on public.watch_history for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own watch history" on public.watch_history;
create policy "Users can update own watch history"
  on public.watch_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Comments are publicly readable" on public.comments;
create policy "Comments are publicly readable"
  on public.comments for select
  using (true);

drop policy if exists "Users can insert own comments" on public.comments;
create policy "Users can insert own comments"
  on public.comments for insert
  with check (
    auth.uid() = user_id
    and is_admin = false
    and is_pinned = false
  );

drop policy if exists "Users can delete own comments" on public.comments;
create policy "Users can delete own comments"
  on public.comments for delete
  using (auth.uid() = user_id);
