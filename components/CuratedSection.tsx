import { ArrowRight } from "lucide-react";
import Link from "next/link";
import PosterCard from "./PosterCard";

const movies = [
  {
    image:
      "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2670&auto=format&fit=crop",
    title: "La Dolce Vita",
    subtitle: "Drama • 1960",
  },
  {
    image:
      "https://images.unsplash.com/photo-1596727147705-61a532a659bd?q=80&w=2574&auto=format&fit=crop",
    title: "Bicycle Thieves",
    subtitle: "Drama • 1948",
  },
  {
    image:
      "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=2574&auto=format&fit=crop",
    title: "Breathless",
    subtitle: "Crime • 1960",
  },
  {
    image:
      "https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=2670&auto=format&fit=crop",
    title: "Amélie",
    subtitle: "Romance • 2001",
  },
];

export default function CuratedSection() {
  return (
    <section className="flex flex-col gap-8 reveal-element">
      {/* Section Header */}
      <div className="flex justify-between items-end border-b border-cinema-redlight/30 pb-4">
        <h2 className="font-serif text-3xl text-stone-100 tracking-tight">
          Curated Selection
        </h2>
        <Link
          href="#"
          className="text-sm text-cinema-gold hover:text-cinema-goldglow flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {movies.map((movie, index) => (
          <PosterCard
            key={index}
            image={movie.image}
            title={movie.title}
            subtitle={movie.subtitle}
            aspect="2/3"
            grayscale
            showTicketButton
          />
        ))}
      </div>
    </section>
  );
}
