import { ArrowLeft, ArrowRight } from "lucide-react";
import PosterCard from "./PosterCard";

const movies = [
  {
    image:
      "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=2656&auto=format&fit=crop",
    title: "2001: A Space Odyssey",
    subtitle: "Stanley Kubrick • 1968",
    badge: "Restored 4K",
  },
  {
    image:
      "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg",
    title: "Seven Samurai",
    subtitle: "Akira Kurosawa • 1954",
    badge: "Limited Run",
  },
  {
    image:
      "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg",
    title: "Casablanca",
    subtitle: "Michael Curtiz • 1942",
    badge: "Matinee",
  },
  {
    image:
      "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=2574&auto=format&fit=crop",
    title: "8½",
    subtitle: "Federico Fellini • 1963",
    badge: "New Arrival",
  },
];

export default function NowShowingSection() {
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
        {movies.map((movie, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-64 md:w-80 snap-start"
          >
            <PosterCard
              image={movie.image}
              title={movie.title}
              subtitle={movie.subtitle}
              badge={movie.badge}
              aspect="4/5"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
