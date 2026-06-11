-- Phase 3 core schema, permissions, and subscription normalization for Lumiere Cinema.
-- Run this in Supabase SQL Editor after the movies table exists.

create extension if not exists pgcrypto;

-- Shared timestamp trigger.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles are the source of truth for subscription state.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  phone_number text,
  subscription_tier text not null default 'Free',
  subscription_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists phone_number text;
alter table public.profiles add column if not exists subscription_tier text not null default 'Free';
alter table public.profiles add column if not exists subscription_expires_at timestamptz;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

update public.profiles
set subscription_tier = 'Free'
where subscription_tier is null
   or subscription_tier not in ('Free', 'Premium', 'VIP');

alter table public.profiles alter column subscription_tier set default 'Free';
alter table public.profiles alter column subscription_tier set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_subscription_tier_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_subscription_tier_check
      check (subscription_tier in ('Free', 'Premium', 'VIP'));
  end if;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.prevent_client_subscription_changes()
returns trigger
language plpgsql
as $$
begin
  if current_setting('request.jwt.claim.role', true) = 'authenticated'
     and (
       old.subscription_tier is distinct from new.subscription_tier
       or old.subscription_expires_at is distinct from new.subscription_expires_at
     ) then
    raise exception 'Subscription fields can only be changed by a trusted server role.';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_subscription_fields on public.profiles;
create trigger profiles_protect_subscription_fields
  before update on public.profiles
  for each row execute function public.prevent_client_subscription_changes();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, subscription_tier)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'Free'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (
    auth.uid() = id
    and coalesce(subscription_tier, 'Free') = 'Free'
    and subscription_expires_at is null
  );

drop policy if exists "Users can update own non-billing profile fields" on public.profiles;
create policy "Users can update own non-billing profile fields"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- A narrow public view for displaying comment authors without exposing phone/subscription data.
create or replace view public.comment_profiles as
select id, display_name, avatar_url
from public.profiles;

grant select on public.comment_profiles to anon, authenticated;

-- Movies are public-readable in the app; writes should stay server/admin side.
alter table public.movies enable row level security;

drop policy if exists "Movies are publicly readable" on public.movies;
create policy "Movies are publicly readable"
  on public.movies for select
  using (true);

-- User watchlist.
create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id text not null references public.movies(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.watchlists add column if not exists id uuid default gen_random_uuid();
alter table public.watchlists add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.watchlists add column if not exists movie_id text references public.movies(id) on delete cascade;
alter table public.watchlists add column if not exists created_at timestamptz not null default now();

create unique index if not exists watchlists_user_movie_idx
  on public.watchlists(user_id, movie_id);

alter table public.watchlists enable row level security;

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

-- User watch history.
create table if not exists public.watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id text not null references public.movies(id) on delete cascade,
  progress_seconds integer not null default 0,
  last_watched_at timestamptz not null default now()
);

alter table public.watch_history add column if not exists id uuid default gen_random_uuid();
alter table public.watch_history add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.watch_history add column if not exists movie_id text references public.movies(id) on delete cascade;
alter table public.watch_history add column if not exists progress_seconds integer not null default 0;
alter table public.watch_history add column if not exists last_watched_at timestamptz not null default now();

create unique index if not exists watch_history_user_movie_idx
  on public.watch_history(user_id, movie_id);

alter table public.watch_history enable row level security;

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

-- Comments.
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

alter table public.comments add column if not exists id uuid default gen_random_uuid();
alter table public.comments add column if not exists movie_id text references public.movies(id) on delete cascade;
alter table public.comments add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.comments add column if not exists content text;
alter table public.comments add column if not exists is_admin boolean not null default false;
alter table public.comments add column if not exists is_pinned boolean not null default false;
alter table public.comments add column if not exists created_at timestamptz not null default now();
alter table public.comments add column if not exists updated_at timestamptz not null default now();

create index if not exists comments_movie_created_idx
  on public.comments(movie_id, is_pinned desc, created_at desc);

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

alter table public.comments enable row level security;

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

drop policy if exists "Users can update own comments" on public.comments;
create policy "Users can update own comments"
  on public.comments for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and is_admin = false
    and is_pinned = false
  );

drop policy if exists "Users can delete own comments" on public.comments;
create policy "Users can delete own comments"
  on public.comments for delete
  using (auth.uid() = user_id);

-- Avatar storage bucket and owner-only object policies.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Avatar images are publicly readable" on storage.objects;
create policy "Avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
