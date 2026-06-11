import { Star, Clock, Calendar, Film } from "lucide-react";
import type { Database } from "@/types/database.types";

type Movie = Database['public']['Tables']['movies']['Row'];

interface MovieInfoProps {
  movie: Movie;
}

export default function MovieInfo({ movie }: MovieInfoProps) {
  return (
    <section className="flex flex-col gap-8">
      {/* About Header */}
      <div className="border-b border-cinema-redlight/30 pb-4">
        <h2 className="font-serif text-2xl md:text-3xl text-stone-100 tracking-tight">
          Về phim
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
        {/* Description */}
        <div>
          <p className="text-stone-300 leading-relaxed text-sm md:text-base">
            {movie.description || "No description available."}
          </p>
        </div>

        {/* Info sidebar */}
        <div className="flex flex-col gap-4 p-6 rounded-lg bg-white/5 border border-white/10">
          <h3 className="font-serif text-lg text-stone-200 border-b border-white/10 pb-3">
            Thông tin phim
          </h3>

          <InfoRow
            icon={<Star className="w-4 h-4 text-cinema-gold" />}
            label="Đánh giá"
            value={movie.rating ? `${movie.rating}/10` : "Chưa có"}
          />
          <InfoRow
            icon={<Clock className="w-4 h-4 text-cinema-gold" />}
            label="Thời lượng"
            value={movie.duration || "Chưa có"}
          />
          <InfoRow
            icon={<Calendar className="w-4 h-4 text-cinema-gold" />}
            label="Năm phát hành"
            value={movie.release_year?.toString() || "Chưa có"}
          />
          <InfoRow
            icon={<Film className="w-4 h-4 text-cinema-gold" />}
            label="Thể loại"
            value={movie.genre || "Chưa có"}
          />
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {icon}
      <span className="text-stone-400 min-w-[90px]">{label}</span>
      <span className="text-stone-200 font-medium">{value}</span>
    </div>
  );
}
