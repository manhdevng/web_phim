
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { buildMovieEmbeddingText, generateEmbedding } from '../utils/embeddings';

// Load env variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const tmdbApiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

type TmdbGenre = {
  id: number;
  name: string;
};

type TmdbVideo = {
  key: string;
  site: string;
  type: string;
};

type TmdbMovie = {
  id: number;
  title?: string;
  original_title?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  vote_average?: number;
  original_language?: string;
  section?: string;
};

type TmdbMovieDetails = {
  runtime?: number;
  genres?: TmdbGenre[];
  videos?: {
    results?: TmdbVideo[];
  };
};

type SyncedMovie = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  poster_url: string | null;
  backdrop_url: string | null;
  release_year: number;
  duration: string;
  rating: number;
  genre: string;
  trailer_url: string | null;
  section: string | undefined;
  badge: string | null;
  embedding?: number[] | null;
};

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  const queryParams = new URLSearchParams({
    api_key: tmdbApiKey,
    language: 'vi-VN',
    ...params,
  });
  
  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${queryParams}`);
  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.statusText}`);
  }
  return response.json();
}

async function getMovieDetails(movieId: number) {
  return fetchFromTMDB(`/movie/${movieId}`, { append_to_response: 'videos' });
}

async function syncTMDB() {
  console.log('🚀 Bắt đầu đồng bộ phim từ TMDB...');

  if (!tmdbApiKey) {
    console.error('❌ Lỗi: Không tìm thấy NEXT_PUBLIC_TMDB_API_KEY trong .env.local');
    return;
  }

  if (!supabaseKey) {
    console.error('❌ Lỗi: Không tìm thấy SUPABASE_SERVICE_ROLE_KEY trong .env.local. Script sync cần service role để ghi dữ liệu khi RLS được bật.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 0. Xóa dữ liệu cũ để làm mới danh sách (Tùy chọn: bạn có thể xóa hết hoặc chỉ xóa phim TMDB)
    console.log('--- Đang làm sạch danh sách phim cũ ---');
    await supabase.from('movies').delete().neq('id', 'temp-id-to-delete-all'); 

    // 1. Lấy danh sách phim Trending
    console.log('--- Đang lấy phim Trending ---');
    const trendingData = await fetchFromTMDB('/trending/movie/day');
    const trendingMovies = (trendingData.results as TmdbMovie[]).slice(0, 10); // Lấy 10 phim đầu

    // 2. Lấy danh sách phim Việt Nam (Original Language = vi)
    console.log('--- Đang tìm phim Việt Nam ---');
    const vnData = await fetchFromTMDB('/discover/movie', { with_original_language: 'vi', sort_by: 'release_date.desc' });
    const vnMovies = (vnData.results as TmdbMovie[]).slice(0, 10).map((movie) => ({ ...movie, section: 'vietnamese' }));

    // 3. Lấy phim theo Thể loại
    console.log('--- Đang lấy phim theo Thể loại ---');
    const genres = [
      { id: 28, name: 'action' },
      { id: 10749, name: 'romance' },
      { id: 27, name: 'horror' },
      { id: 16, name: 'animation' }
    ];

    let genreMovies: TmdbMovie[] = [];
    for (const g of genres) {
      const gData = await fetchFromTMDB('/discover/movie', { with_genres: g.id.toString(), sort_by: 'popularity.desc' });
      genreMovies = [...genreMovies, ...(gData.results as TmdbMovie[]).slice(0, 8).map((movie) => ({ ...movie, section: g.name }))];
    }

    const allMoviesToSync = [
      ...trendingMovies.map((movie) => ({ ...movie, section: 'trending' })), 
      ...vnMovies, 
      ...genreMovies
    ];
    
    console.log(`✅ Tìm thấy tổng cộng ${allMoviesToSync.length} bộ phim.`);

    for (const movie of allMoviesToSync) {
      // Lấy chi tiết sâu hơn (runtime, trailer)
      const detail = await getMovieDetails(movie.id) as TmdbMovieDetails;
      const trailer = detail.videos?.results?.find((video) => video.type === 'Trailer' && video.site === 'YouTube');
      
      const movieData: SyncedMovie = {
        id: `tmdb-${movie.id}`,
        title: movie.title || movie.original_title || `TMDB ${movie.id}`,
        subtitle: `${movie.release_date?.split('-')[0] || '2024'} • ${detail.genres?.[0]?.name || 'Phim'}`,
        description: movie.overview || "Chưa có mô tả tiếng Việt cho phim này.",
        poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        backdrop_url: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
        release_year: parseInt(movie.release_date?.split('-')[0] ?? '2024', 10) || 2024,
        duration: detail.runtime ? `${Math.floor(detail.runtime / 60)}h ${detail.runtime % 60}m` : '120m',
        rating: movie.vote_average || 0,
        genre: detail.genres?.map((genre) => genre.name).join(', ') || 'Hành động',
        trailer_url: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
        section: movie.section, // Dùng section đã gán ở trên
        badge: (movie.vote_average ?? 0) > 8 ? 'Đoạt giải' : (movie.original_language === 'vi' ? 'Phim Việt' : null),
      };

      if (geminiApiKey) {
        try {
          movieData.embedding = await generateEmbedding(buildMovieEmbeddingText(movieData));
        } catch (embeddingError) {
          console.warn(
            `⚠️ Không tạo được embedding cho ${movieData.title}:`,
            embeddingError instanceof Error ? embeddingError.message : 'Unknown embedding error'
          );
        }
      }

      const { error } = await supabase.from('movies').upsert(movieData);

      if (error) {
        console.error(`❌ Lỗi phim ${movieData.title}:`, error.message);
      } else {
        console.log(`⭐ Đã đồng bộ: ${movieData.title} (${movie.original_language === 'vi' ? 'VN' : 'Trending'})`);
      }
    }

    console.log('🎉 Hoàn thành! Phim từ TMDB đã được cập nhật vào web của bạn.');

  } catch (error) {
    console.error('❌ Lỗi:', error instanceof Error ? error.message : 'Unknown error');
  }
}

syncTMDB();
