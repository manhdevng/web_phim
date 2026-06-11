import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildMovieEmbeddingText, generateEmbedding } from "@/utils/embeddings";

type SyncResult = {
  id: string;
  title?: string | null;
  status: "success" | "error";
  message?: string;
};

/**
 * Route: POST /api/ai/sync-embeddings
 * Mục đích: Chạy một lần để tạo Vector Embeddings cho toàn bộ phim hiện có.
 */
export async function POST() {
  try {
    const supabase = createAdminClient();

    const { data: movies, error: fetchError } = await supabase
      .from("movies")
      .select("id, title, subtitle, description, genre, release_year")
      .is("embedding", null)
      .limit(200);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!movies || movies.length === 0) {
      return NextResponse.json({ message: "Tất cả phim đã được đồng bộ!" });
    }

    console.log(`[LUMIÈRE AI] Đang đồng bộ ${movies.length} bộ phim...`);

    const results: SyncResult[] = [];
    for (const movie of movies) {
      try {
        const contentToEmbed = buildMovieEmbeddingText(movie);
        const embedding = await generateEmbedding(contentToEmbed);

        const { error: updateError } = await supabase
          .from("movies")
          .update({ embedding })
          .eq("id", movie.id);

        if (updateError) {
          results.push({ id: movie.id, title: movie.title, status: "error", message: updateError.message });
        } else {
          results.push({ id: movie.id, title: movie.title, status: "success" });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown embedding error";
        results.push({ id: movie.id, title: movie.title, status: "error", message });
      }
    }

    return NextResponse.json({
      message: "Quá trình đồng bộ hoàn tất",
      total: movies.length,
      details: results
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
