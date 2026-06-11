import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import MoviePlayer from "@/features/movies/components/MoviePlayer";
import CommentSection from "@/features/movies/components/CommentSection";
import MovieInfo from "@/features/movies/components/MovieInfo";
import RelatedMovies from "@/features/movies/components/RelatedMovies";
import Footer from "@/components/shared/Footer";
import AddToWatchlistButton from "@/components/shared/AddToWatchlistButton";
import { checkIsWatchlisted, getMovieById } from "@/features/movies/queries";
import type { Movie } from "@/types/database.types";
import MovieAIAssistant from "@/features/movies/components/MovieAIAssistant";
import { createClient } from "@/lib/supabase/server";
import { isPaidSubscription } from "@/features/profile/subscription";

interface MovieDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: MovieDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovieById(id);

  if (!movie) {
    return { title: "Phim không tồn tại - Lumière" };
  }

  return {
    title: `${movie.title} - Lumière Cinema`,
    description: movie.description || `Xem phim ${movie.title} tại Lumière Cinema`,
    openGraph: movie.poster_url
      ? { images: [{ url: movie.poster_url }] }
      : undefined,
  };
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { id } = await params;
  let movie: Movie | null = null;
  let isLoggedIn = false;
  let isPremium = false;
  let isWatchlisted = false;

  try {
    movie = await getMovieById(id);
    
    // Check auth status
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      isLoggedIn = true;
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();
        
      isPremium = isPaidSubscription(profile?.subscription_tier);
      isWatchlisted = await checkIsWatchlisted(user.id, id);
    }
  } catch (error) {
    console.error("[MovieDetailPage] Error:", error);
  }

  if (!movie) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      
      {/* 1. MOVIE PLAYER SECTION (TOP) */}
      <section className="w-full pt-[72px] bg-black">
        <MoviePlayer 
          url={movie.trailer_url || ""} 
          title={movie.title} 
          tmdbId={movie.id}
          poster={movie.backdrop_url || movie.poster_url || ""}
          isLoggedIn={isLoggedIn}
          isPremium={isPremium}
          badge={movie.badge}
        />
      </section>

      {/* 2. CONTENT CONTAINER */}
      <div className="max-w-[90vw] mx-auto border-x border-cinema-redlight/10 bg-[#0a0a0a]/50">
        <div className="px-4 md:px-12 flex flex-col gap-y-12 py-12">
          {/* Movie Title & Primary Meta */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-2">
                <span className="bg-cinema-gold text-black px-2 py-0.5 rounded text-[10px] font-black uppercase">
                  LUMIÈRE VIP
                </span>
                <span className="text-white/40 text-xs font-bold tracking-widest">
                  4K ULTRA HD • {movie.release_year}
                </span>
             </div>
             <h1 className="font-playfair text-4xl md:text-6xl text-white font-bold tracking-tight">
               {movie.title}
             </h1>
             <div>
               <AddToWatchlistButton movieId={movie.id} initialWatchlisted={isWatchlisted} />
             </div>
             <p className="text-stone-300 leading-relaxed mb-6">
                {movie.description}
             </p>
             <MovieAIAssistant description={movie.description || ""} />
          </div>

          <MovieInfo movie={movie} />
          
          {/* NEW: Comment Section */}
          <CommentSection movieId={movie.id} />

          <RelatedMovies currentMovie={movie} />
        </div>
        <Footer />
      </div>
    </div>
  );
}
