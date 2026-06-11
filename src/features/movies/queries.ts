/**
 * features/movies/queries.ts
 *
 * Đây là tầng truy vấn dữ liệu (Data Access Layer) cho tính năng phim.
 * Tương đương với /server/models + /server/controllers trong kiến trúc MERN.
 *
 * Tất cả các hàm tương tác với bảng `movies` trên Supabase đều đặt ở đây.
 */

import { createClient } from "@/lib/supabase/server";
import type { Movie } from "@/types/database.types";

type MovieJoinRow = {
  movies: Movie | Movie[] | null;
};

function normalizeJoinedMovie(row: MovieJoinRow): Movie | null {
  if (Array.isArray(row.movies)) return row.movies[0] ?? null;
  return row.movies ?? null;
}

/** Lấy tất cả phim thuộc một section cụ thể (hero, now_showing...) */
export async function getMoviesBySection(section: string): Promise<Movie[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .eq("section", section);

  if (error) {
    console.error(`[getMoviesBySection] Error fetching section "${section}":`, error.message);
    return [];
  }
  return data ?? [];
}

/** Lấy tất cả phim */
export async function getAllMovies(): Promise<Movie[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("movies").select("*");

  if (error) {
    console.error("[getAllMovies] Error:", error.message);
    return [];
  }
  return data ?? [];
}

/** Lấy chi tiết một bộ phim theo ID */
export async function getMovieById(id: string): Promise<Movie | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .eq("id", id)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(`[getMovieById] Error fetching movie "${id}":`, error.message);
    return null;
  }
  return data;
}

/** Lấy danh sách phim yêu thích của một user */
export async function getWatchlistMovies(userId: string): Promise<Movie[]> {
  const supabase = await createClient();
  
  // Join bảng watchlists và movies
  const { data, error } = await supabase
    .from("watchlists")
    .select(`
      movie_id,
      movies (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`[getWatchlistMovies] Error:`, error.message);
    return [];
  }

  // Lọc và trả về mảng Movie từ kết quả join
  return (
    data
      ?.map((item) => normalizeJoinedMovie(item as MovieJoinRow))
      .filter((movie): movie is Movie => Boolean(movie)) ?? []
  );
}

/** Lấy danh sách phim tương tự (cùng thể loại, trừ phim hiện tại) */
export async function getRelatedMovies(genre: string | null, excludeId: string, limit: number = 6): Promise<Movie[]> {
  if (!genre) return [];

  const supabase = await createClient();
  const genres = genre.split(",").map((g) => g.trim());

  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .neq("id", excludeId)
    .or(genres.map((g) => `genre.ilike.%${g}%`).join(","))
    .limit(limit);

  if (error) {
    console.error(`[getRelatedMovies] Error:`, error.message);
    return [];
  }
  return data ?? [];
}
export async function checkIsWatchlisted(userId: string, movieId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("watchlists")
    .select("id")
    .eq("user_id", userId)
    .eq("movie_id", movieId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error(`[checkIsWatchlisted] Error:`, error.message);
  }
  
  return !!data;
}

export type MovieWithRating = Movie & { average_rating?: number };

/** Lấy danh sách phim được đánh giá cao nhất */
export async function getTopRatedMovies(limit: number = 10): Promise<MovieWithRating[]> {
  const supabase = await createClient();
  const { data: stats } = await supabase
    .from("movie_rating_stats")
    .select("movie_id, average_rating")
    .order("average_rating", { ascending: false })
    .limit(limit);

  if (!stats || stats.length === 0) return [];
  
  const movieIds = stats.map(s => s.movie_id);
  const { data: movies, error } = await supabase
    .from("movies")
    .select("*")
    .in("id", movieIds);

  if (error) {
    console.error("[getTopRatedMovies] Error fetching movies:", error.message);
    return [];
  }

  // Re-order movies based on the stats order and attach average_rating
  if (!movies) return [];
  return movieIds
    .map(id => {
      const movie = movies.find(m => m.id === id);
      const stat = stats.find(s => s.movie_id === id);
      if (movie && stat) {
        return { ...movie, average_rating: stat.average_rating };
      }
      return null;
    })
    .filter(Boolean) as MovieWithRating[];
}
