-- Tạo bảng movie_ratings để lưu đánh giá sao
create table if not exists public.movie_ratings (
  id uuid primary key default gen_random_uuid(),
  movie_id text not null references public.movies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(movie_id, user_id) -- Mỗi user chỉ được đánh giá 1 phim 1 lần
);

-- Bật bảo mật RLS
alter table public.movie_ratings enable row level security;

-- Mọi người đều có quyền xem đánh giá
create policy "Ratings are publicly readable"
  on public.movie_ratings for select
  using (true);

-- User được tạo đánh giá của riêng mình
create policy "Users can insert own rating"
  on public.movie_ratings for insert
  with check (auth.uid() = user_id);

-- User được sửa đánh giá của chính mình
create policy "Users can update own rating"
  on public.movie_ratings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trigger tự cập nhật updated_at
create trigger movie_ratings_set_updated_at
  before update on public.movie_ratings
  for each row execute function public.set_updated_at();

-- (Tuỳ chọn) Tạo View để tính trung bình sao của mỗi phim nhanh hơn
create or replace view public.movie_rating_stats as
select 
  movie_id,
  round(avg(rating)::numeric, 1) as average_rating,
  count(rating) as total_ratings
from public.movie_ratings
group by movie_id;

grant select on public.movie_rating_stats to anon, authenticated;
