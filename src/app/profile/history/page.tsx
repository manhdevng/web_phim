import PosterCard from "@/features/movies/components/PosterCard";
import { createClient } from "@/lib/supabase/server";
import type { Movie } from "@/types/database.types";

type HistoryRow = {
  progress_seconds: number | null;
  last_watched_at: string | null;
  movies: Movie | Movie[] | null;
};

function normalizeMovie(row: HistoryRow): Movie | null {
  if (Array.isArray(row.movies)) return row.movies[0] ?? null;
  return row.movies ?? null;
}

function formatWatchedAt(value: string | null) {
  if (!value) return "Vừa xem";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let history: Array<{
    movie: Movie;
    progressSeconds: number;
    lastWatchedAt: string | null;
  }> = [];
  let errorMessage: string | null = null;

  if (user) {
    const { data, error } = await supabase
      .from("watch_history")
      .select("progress_seconds, last_watched_at, movies(*)")
      .eq("user_id", user.id)
      .order("last_watched_at", { ascending: false });

    if (error) {
      errorMessage = error.message;
    } else {
      history =
        data
          ?.map((row) => {
            const typedRow = row as HistoryRow;
            const movie = normalizeMovie(typedRow);
            if (!movie) return null;
            return {
              movie,
              progressSeconds: typedRow.progress_seconds ?? 0,
              lastWatchedAt: typedRow.last_watched_at,
            };
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item)) ?? [];
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="font-playfair text-3xl md:text-4xl text-white mb-2">Lịch sử xem phim</h1>
      <p className="text-stone-400 font-inter mb-8">Những bộ phim bạn đã thưởng thức gần đây.</p>

      {errorMessage ? (
        <div className="py-16 text-center text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
          Không tải được lịch sử xem phim: {errorMessage}
        </div>
      ) : history.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {history.map(({ movie, progressSeconds, lastWatchedAt }) => (
            <div key={movie.id} className="relative group">
              <PosterCard
                image={movie.poster_url || ""}
                title={movie.title}
                subtitle={`Xem lúc ${formatWatchedAt(lastWatchedAt)}`}
                badge="Đã xem"
                aspect="2/3"
                movieId={movie.id}
              />
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50 overflow-hidden rounded-b-2xl z-10">
                <div
                  className="h-full bg-amber-500"
                  style={{ width: `${Math.min(100, Math.max(20, progressSeconds ? 35 : 20))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <span className="text-2xl">▶</span>
          </div>
          <h3 className="text-xl text-white font-playfair mb-2">Chưa có lịch sử</h3>
          <p className="text-stone-400 font-inter max-w-sm">
            Bạn chưa xem bộ phim nào gần đây. Hãy khám phá thư viện phim của chúng tôi.
          </p>
        </div>
      )}
    </div>
  );
}
