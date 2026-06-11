"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Movie } from "@/types/database.types";

interface UseMoviesResult {
  movies: Movie[];
  isLoading: boolean;
  error: string | null;
}

export function useMoviesBySection(section: string): UseMoviesResult {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function fetchMovies() {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("movies")
        .select("*")
        .eq("section", section);

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setMovies([]);
      } else {
        setMovies(data ?? []);
      }
      setIsLoading(false);
    }

    fetchMovies();
    return () => { cancelled = true; };
  }, [section]);

  return { movies, isLoading, error };
}
