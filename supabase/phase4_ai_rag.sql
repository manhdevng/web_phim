-- Phase 4 AI/RAG setup for Lumiere Cinema.
-- Run this in Supabase SQL Editor after the core schema exists.

create extension if not exists vector;

alter table public.movies
  add column if not exists embedding vector(768);

create index if not exists movies_embedding_hnsw_idx
  on public.movies
  using hnsw (embedding vector_cosine_ops);

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
