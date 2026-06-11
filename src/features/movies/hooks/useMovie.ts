"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Movie } from "@/types/database.types";

interface UseMovieResult {
  movie: Movie | null;
  isLoading: boolean;
  error: string | null;
}

export function useMovie(id: string | undefined): UseMovieResult {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    async function fetchMovie() {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("movies")
        .select("*")
        .eq("id", id)
        .single();

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setMovie(null);
      } else {
        setMovie(data);
      }
      setIsLoading(false);
    }

    fetchMovie();
    return () => { cancelled = true; };
  }, [id]);

  return { movie, isLoading, error };
}
