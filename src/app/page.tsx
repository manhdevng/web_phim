import Navbar from "@/components/shared/Navbar";
import HeroSlider from "@/features/movies/components/HeroSlider";
import MovieRow from "@/features/movies/components/MovieRow";
import MarqueeStudios from "@/features/movies/components/MarqueeStudios";
import ReviewsMarquee from "@/features/movies/components/ReviewsMarquee";
import Footer from "@/components/shared/Footer";
import SpotlightWrapper from "@/components/shared/SpotlightWrapper";
import { getMoviesBySection, getTopRatedMovies } from "@/features/movies/queries";
import type { Movie } from "@/types/database.types";

export const revalidate = 0;

export default async function Home() {
  let heroMovies: Movie[] = [];
  let trendingMovies: Movie[] = [];
  let vnMovies: Movie[] = [];
  let actionMovies: Movie[] = [];
  let romanceMovies: Movie[] = [];
  let horrorMovies: Movie[] = [];
  let animationMovies: Movie[] = [];
  let topRatedMovies: any[] = [];

  try {
    [
      heroMovies, 
      trendingMovies, 
      vnMovies, 
      actionMovies, 
      romanceMovies, 
      horrorMovies, 
      animationMovies,
      topRatedMovies
    ] = await Promise.all([
      getMoviesBySection("trending"), // Dùng trending cho Hero luôn
      getMoviesBySection("trending"),
      getMoviesBySection("vietnamese"),
      getMoviesBySection("action"),
      getMoviesBySection("romance"),
      getMoviesBySection("horror"),
      getMoviesBySection("animation"),
      getTopRatedMovies(10),
    ]);
  } catch (error) {
    console.error("[Home] Failed to fetch movies:", error);
  }

  return (
    <SpotlightWrapper>
      <Navbar />
      
      {/* Banner chính (Hero) */}
      <section className="w-full">
        <HeroSlider slides={heroMovies.slice(0, 5)} />
      </section>

      {/* Nội dung chính của rạp phim */}
      <div className="max-w-[90vw] mx-auto border-x border-white/5 bg-[#0a0a0a]/50">
        <div className="flex flex-col gap-y-16 md:gap-24 pt-16 md:pt-24 pb-32">
          
          <MovieRow title="Xu hướng hiện nay" movies={trendingMovies} />
          
          {topRatedMovies.length > 0 && (
            <MovieRow title="Tuyệt tác đánh giá cao" movies={topRatedMovies} />
          )}

          <MarqueeStudios />
          
          <MovieRow title="Phim Việt Nam đặc sắc" movies={vnMovies} />
          
          <MovieRow title="Hành động kịch tính" movies={actionMovies} />
          
          <MovieRow title="Tình cảm lãng mạn" movies={romanceMovies} />
          
          <MovieRow title="Kinh dị rùng rợn" movies={horrorMovies} />
          
          <MovieRow title="Phim Hoạt hình" movies={animationMovies} />
          
          <ReviewsMarquee />
        </div>
        <Footer />
      </div>
    </SpotlightWrapper>
  );
}
