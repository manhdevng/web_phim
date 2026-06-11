import PosterCard from "./PosterCard";
import type { Database } from "@/types/database.types";
import { getRelatedMovies } from "../queries";

type Movie = Database['public']['Tables']['movies']['Row'];

interface RelatedMoviesProps {
  currentMovie: Movie;
}

export default async function RelatedMovies({ currentMovie }: RelatedMoviesProps) {
  let relatedMovies: Movie[] = [];

  try {
    relatedMovies = await getRelatedMovies(
      currentMovie.genre,
      currentMovie.id,
      6
    );
  } catch (error) {
    console.error("[RelatedMovies] Failed to fetch:", error);
  }

  if (relatedMovies.length === 0) return null;

  return (
    <section className="flex flex-col gap-6 reveal-element">
      <div className="border-b border-cinema-redlight/30 pb-4">
        <h2 className="font-serif text-2xl md:text-3xl text-stone-100 tracking-tight">
          Phim tương tự
        </h2>
      </div>

      <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 snap-x snap-mandatory hide-scrollbar">
        {relatedMovies.map((movie) => (
          <div key={movie.id} className="flex-shrink-0 w-48 md:w-56 snap-start">
            <PosterCard
              image={movie.poster_url || ""}
              title={movie.title}
              subtitle={movie.subtitle || movie.genre || ""}
              badge={movie.badge || undefined}
              aspect="2/3"
              movieId={movie.id}
            />
          </div>
        ))}
      </div>
    </section>
  );
}