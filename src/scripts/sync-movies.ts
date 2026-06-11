
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { buildMovieEmbeddingText, generateEmbedding } from '../utils/embeddings';

// Load env variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const apifyToken = process.env.APIFY_TOKEN?.trim();
const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;

type ApifyMovie = {
  id?: string | number;
  title?: string;
  name?: string;
  release_date?: string;
  genres?: string[];
  genre?: string;
  overview?: string;
  description?: string;
  poster_path?: string | null;
  posterUrl?: string | null;
  backdrop_path?: string | null;
  backdropUrl?: string | null;
  runtime?: number;
  vote_average?: number;
};

type SyncedMovie = {
  id: string;
  title: string;
  subtitle: string;
  description: string | null;
  poster_url: string | null | undefined;
  backdrop_url: string | null | undefined;
  release_year: number;
  duration: string;
  rating: number;
  genre: string | undefined;
  section: string;
  badge: string | null;
  embedding?: number[] | null;
};

async function syncFromApify() {
  console.log('🚀 Đang kết nối tới Apify để lấy dữ liệu phim...');
  
  if (!apifyToken) {
    console.error('❌ Lỗi: Không tìm thấy APIFY_TOKEN trong file .env.local');
    return;
  }

  if (!supabaseKey) {
    console.error('❌ Lỗi: Không tìm thấy SUPABASE_SERVICE_ROLE_KEY trong .env.local. Script sync cần service role để ghi dữ liệu khi RLS được bật.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Lấy dữ liệu từ Dataset cụ thể của bạn trên Apify
    const datasetId = 'm948iqjKQQ4m7gMrW'; 
    const apifyUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}&format=json&clean=true`;
    
    const response = await fetch(apifyUrl);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ Lỗi từ Apify (Mã ${response.status}):`, errorData);
      return;
    }

    const apifyData = (await response.json()) as ApifyMovie[];
    console.log(`✅ Đã tìm thấy ${apifyData.length} bản ghi từ Apify.`);

    for (const item of apifyData) {
      // 2. Chuyển đổi dữ liệu từ Apify sang định dạng của web chúng ta
      // (Lưu ý: Tên các trường ở đây phụ thuộc vào Actor bạn chọn, mình đang để theo chuẩn TMDB Scraper)
      const movieData: SyncedMovie = {
        id: `apify-${item.id || Math.random().toString(36).substr(2, 9)}`,
        title: item.title || item.name || `Apify ${item.id || Date.now()}`,
        subtitle: `${item.release_date?.split('-')[0] || '2024'} • ${item.genres?.[0] || 'Phim'}`,
        description: item.overview || item.description || null,
        poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : item.posterUrl,
        backdrop_url: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : item.backdropUrl,
        release_year: parseInt(item.release_date?.split('-')[0] ?? '2024', 10) || 2024,
        duration: item.runtime ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m` : '120m',
        rating: item.vote_average || 8.0,
        genre: Array.isArray(item.genres) ? item.genres.join(', ') : item.genre,
        section: 'now_showing',
        badge: (item.vote_average ?? 0) > 8 ? 'Hot' : null,
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

      // 3. Đẩy vào Supabase
      const { error } = await supabase.from('movies').upsert(movieData);

      if (error) {
        console.error(`❌ Lỗi phim ${movieData.title}:`, error.message);
      } else {
        console.log(`⭐ Đã đồng bộ: ${movieData.title}`);
      }
    }

    console.log('🎉 Hoàn thành! Dữ liệu từ Apify đã được cập nhật vào web của bạn.');

  } catch (error) {
    console.error('❌ Lỗi:', error instanceof Error ? error.message : 'Unknown error');
  }
}

syncFromApify();
