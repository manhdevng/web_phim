import { getMoviesBySection } from "@/features/movies/queries";
import MovieGrid from "@/features/movies/components/MovieGrid";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

interface GenrePageProps {
  params: Promise<{ slug: string }>;
}

const genreNames: Record<string, string> = {
  action: "Phim Hành Động",
  romance: "Phim Tình Cảm",
  horror: "Phim Kinh Dị",
  animation: "Phim Hoạt Hình",
  "sci-fi": "Phim Viễn Tưởng",
  vietnamese: "Phim Việt Nam",
};

export default async function GenrePage({ params }: GenrePageProps) {
  const { slug } = await params;
  const movies = await getMoviesBySection(slug);
  const title = genreNames[slug] || "Thể loại phim";

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <MovieGrid title={title} movies={movies} />
      <Footer />
    </main>
  );
}
