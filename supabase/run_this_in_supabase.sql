-- Lumiere Cinema Supabase setup.
-- Copy this whole file into Supabase SQL Editor and run all of it at once.
-- Do not run only a highlighted section, because triggers depend on functions created at the top.

create extension if not exists pgcrypto;
create extension if not exists vector;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

create table if not exists public.movies (
  id text primary key,
  title text not null,
  subtitle text,
  description text,
  poster_url text,
  backdrop_url text,
  release_year integer,
  duration text,
  rating numeric,
  genre text,
  trailer_url text,
  badge text,
  section text,
  created_at timestamptz not null default now()
);

alter table public.movies add column if not exists title text;
alter table public.movies add column if not exists subtitle text;
alter table public.movies add column if not exists description text;
alter table public.movies add column if not exists poster_url text;
alter table public.movies add column if not exists backdrop_url text;
alter table public.movies add column if not exists release_year integer;
alter table public.movies add column if not exists duration text;
alter table public.movies add column if not exists rating numeric;
alter table public.movies add column if not exists genre text;
alter table public.movies add column if not exists trailer_url text;
alter table public.movies add column if not exists badge text;
alter table public.movies add column if not exists section text;
alter table public.movies add column if not exists created_at timestamptz not null default now();

alter table public.movies add column if not exists embedding vector(768);

create index if not exists movies_embedding_hnsw_idx
  on public.movies
  using hnsw (embedding vector_cosine_ops);

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

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  role text not null default 'admin',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.admin_users add column if not exists email text;
alter table public.admin_users add column if not exists role text not null default 'admin';
alter table public.admin_users add column if not exists active boolean not null default true;
alter table public.admin_users add column if not exists created_at timestamptz not null default now();
alter table public.admin_users add column if not exists updated_at timestamptz not null default now();

update public.admin_users
set email = lower(trim(email))
where email is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'admin_users_role_check'
      and conrelid = 'public.admin_users'::regclass
  ) then
    alter table public.admin_users
      add constraint admin_users_role_check
      check (role in ('owner', 'admin', 'editor'));
  end if;
end;
$$;

create unique index if not exists admin_users_email_unique_idx
  on public.admin_users (lower(email));

create unique index if not exists admin_users_user_id_unique_idx
  on public.admin_users (user_id)
  where user_id is not null;

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
  before update on public.admin_users
  for each row execute function public.set_updated_at();

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

drop trigger if exists profiles_protect_subscription_fields on public.profiles;
create trigger profiles_protect_subscription_fields
  before update on public.profiles
  for each row execute function public.prevent_client_subscription_changes();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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

create or replace view public.comment_profiles as
select id, display_name, avatar_url
from public.profiles;

grant select on public.comment_profiles to anon, authenticated;

alter table public.movies enable row level security;
alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.watchlists enable row level security;
alter table public.watch_history enable row level security;
alter table public.comments enable row level security;

drop policy if exists "Movies are publicly readable" on public.movies;
create policy "Movies are publicly readable"
  on public.movies for select
  using (true);

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

drop policy if exists "Admin grants are not client readable" on public.admin_users;
create policy "Admin grants are not client readable"
  on public.admin_users for select
  using (false);

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

create or replace function public.match_movies(
  query_embedding vector(768),
  match_threshold float default 0.15,
  match_count int default 10
)
returns table (
  id text,
  title text,
  subtitle text,
  description text,
  poster_url text,
  backdrop_url text,
  release_year integer,
  duration text,
  rating numeric,
  genre text,
  trailer_url text,
  badge text,
  section text,
  similarity float
)
language sql
stable
as $$
  select
    movies.id,
    movies.title,
    movies.subtitle,
    movies.description,
    movies.poster_url,
    movies.backdrop_url,
    movies.release_year,
    movies.duration,
    movies.rating,
    movies.genre,
    movies.trailer_url,
    movies.badge,
    movies.section,
    1 - (movies.embedding <=> query_embedding) as similarity
  from public.movies
  where movies.embedding is not null
    and 1 - (movies.embedding <=> query_embedding) >= match_threshold
  order by movies.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.match_movies(vector, float, int) to anon, authenticated;

-- To grant an admin account after the user signs up with Supabase Auth, run:
-- insert into public.admin_users (user_id, email, role, active)
-- select id, lower(email), 'owner', true
-- from auth.users
-- where lower(email) = lower('your-admin-email@example.com')
-- on conflict ((lower(email))) do update
-- set user_id = excluded.user_id,
--     role = excluded.role,
--     active = true,
--     updated_at = now();
