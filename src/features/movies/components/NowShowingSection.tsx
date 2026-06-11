import { ArrowLeft, ArrowRight } from "lucide-react";
import PosterCard from "./PosterCard";
import type { Database } from "@/types/database.types";

type Movie = Database['public']['Tables']['movies']['Row'];

interface NowShowingSectionProps {
  movies?: Movie[];
}

export default function NowShowingSection({ movies = [] }: NowShowingSectionProps) {
  return (
    <section className="flex flex-col gap-6 reveal-element w-full">
      {/* Section Header */}
      <div
        className="flex border-cinema-redlight/30 border-b pb-4 brightness-200 items-end justify-between"
        style={{
          maskImage:
            "linear-gradient(110deg, transparent, black 10%, black 100%, transparent)",
          WebkitMaskImage:
            "linear-gradient(110deg, transparent, black 10%, black 100%, transparent)",
        }}
      >
        <h2 className="font-serif text-2xl md:text-3xl text-stone-100 tracking-tight">
          Top Now Showing
        </h2>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-full border border-cinema-redlight/50 flex items-center justify-center text-cinema-gold hover:bg-cinema-redlight transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full border border-cinema-redlight/50 flex items-center justify-center text-cinema-gold hover:bg-cinema-redlight transition-colors">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Posters Scroll */}
      <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 snap-x snap-mandatory hide-scrollbar">
        {movies.length === 0 ? (
          <div className="w-full py-20 flex items-center justify-center border border-cinema-redlight/20 rounded-lg bg-zinc-900/50">
            <span className="text-stone-400">Loading movies...</span>
          </div>
        ) : (
          movies.map((movie, index) => (
            <div key={index} className="flex-shrink-0 w-64 md:w-80 snap-start">
              <PosterCard
                image={movie.poster_url || ""}
                title={movie.title}
                subtitle={movie.subtitle || ""}
                badge={movie.badge || undefined}
                aspect="4/5"
                movieId={movie.id}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
