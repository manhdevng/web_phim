"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import PosterCard from "@/features/movies/components/PosterCard";
import { useWatchlist } from "@/features/movies/hooks";
import { createClient } from "@/lib/supabase/client";

export default function WatchlistPage() {
  const { movies, isLoading, error, refresh } = useWatchlist();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (movieId: string) => {
    setRemovingId(movieId);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error: removeError } = await supabase
        .from("watchlists")
        .delete()
        .eq("user_id", user.id)
        .eq("movie_id", movieId);

      if (removeError) throw removeError;
      refresh();
    } catch (removeError) {
      console.error("[WatchlistPage] Remove error:", removeError);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-playfair text-3xl md:text-4xl text-white mb-2">Phim yêu thích</h1>
          <p className="text-stone-400 font-inter">Danh sách các bộ phim bạn muốn xem sau.</p>
        </div>
        <div className="hidden md:block text-sm text-stone-500 font-inter">
          {movies.length} bộ phim
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex items-center justify-center text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-cinema-gold" />
          Đang tải danh sách yêu thích...
        </div>
      ) : error ? (
        <div className="py-16 text-center text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
          Không tải được watchlist: {error}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {movies.map((movie) => (
            <div key={movie.id} className="relative group">
              <PosterCard
                image={movie.poster_url || ""}
                title={movie.title}
                subtitle={movie.subtitle || movie.genre || ""}
                badge={movie.badge || undefined}
                aspect="2/3"
                showTicketButton
                movieId={movie.id}
              />
              <button
                onClick={() => handleRemove(movie.id)}
                disabled={removingId === movie.id}
                className="absolute top-3 right-3 bg-black/60 hover:bg-rose-500/80 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 disabled:opacity-50"
                aria-label={`Xóa ${movie.title} khỏi watchlist`}
              >
                {removingId === movie.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-2xl">+</span>
          </div>
          <h3 className="text-xl text-white font-playfair mb-2">Danh sách trống</h3>
          <p className="text-stone-400 font-inter max-w-sm">
            Bạn chưa thêm bộ phim nào vào danh sách yêu thích.
          </p>
        </div>
      )}
    </div>
  );
}
