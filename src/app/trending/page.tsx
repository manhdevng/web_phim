import { getMoviesBySection } from "@/features/movies/queries";
import MovieGrid from "@/features/movies/components/MovieGrid";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default async function TrendingPage() {
  const movies = await getMoviesBySection("trending");

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <MovieGrid title="Phim Hot & Thịnh Hành" movies={movies} />
      <Footer />
    </main>
  );
}
