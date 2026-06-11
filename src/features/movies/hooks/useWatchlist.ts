"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Movie } from "@/types/database.types";

type WatchlistMovieRow = {
  movies: Movie | Movie[] | null;
};

function normalizeJoinedMovie(row: WatchlistMovieRow): Movie | null {
  if (Array.isArray(row.movies)) return row.movies[0] ?? null;
  return row.movies ?? null;
}

interface UseWatchlistResult {
  movies: Movie[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useWatchlist(): UseWatchlistResult {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function fetchWatchlist() {
      setIsLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {
        setMovies([]);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("watchlists")
        .select("movie_id, movies(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setMovies([]);
      } else {
        setMovies(
          data
            ?.map((item) => normalizeJoinedMovie(item as WatchlistMovieRow))
            .filter((movie): movie is Movie => Boolean(movie)) ?? []
        );
      }
      setIsLoading(false);
    }

    fetchWatchlist();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  return { movies, isLoading, error, refresh };
}
