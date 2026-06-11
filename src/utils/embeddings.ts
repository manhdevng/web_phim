/**
 * src/utils/embeddings.ts
 * 
 * Tiện ích chuyển đổi văn bản thành Vector (Embeddings) sử dụng Google Gemini.
 */

const EMBEDDING_MODEL = "gemini-embedding-001";

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delayMs = 1500) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.ok) return res;
    if (res.status === 429 || res.status === 503) {
      if (i < retries - 1) {
        console.warn(`[API] Status ${res.status}. Retrying in ${delayMs}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
    }
    return res;
  }
  throw new Error("Max retries reached");
}

type GeminiEmbeddingResponse = {
  embedding?: {
    values?: number[];
  };
  error?: {
    message?: string;
  };
};

export function buildMovieEmbeddingText(movie: {
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  genre?: string | null;
  release_year?: number | null;
}): string {
  return [
    `Tiêu đề: ${movie.title ?? "Không rõ"}`,
    movie.subtitle ? `Phụ đề: ${movie.subtitle}` : null,
    movie.genre ? `Thể loại: ${movie.genre}` : null,
    movie.release_year ? `Năm phát hành: ${movie.release_year}` : null,
    movie.description ? `Mô tả: ${movie.description}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Chuyển đổi một chuỗi văn bản thành mảng số (Vector 768 chiều).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const API_KEY = process.env.GOOGLE_GEMINI_API_KEY || "";

  if (!API_KEY) {
    throw new Error("GOOGLE_GEMINI_API_KEY is not defined");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${API_KEY}`;

  try {
    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: {
          parts: [{ text }]
        },
        outputDimensionality: 768
      })
    });

    const data = (await response.json()) as GeminiEmbeddingResponse;

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to generate embedding");
    }

    const values = data.embedding?.values;
    if (!values || values.length === 0) {
      throw new Error("Gemini returned an empty embedding");
    }

    return values;
  } catch (error) {
    console.error("[generateEmbedding] Error:", error);
    throw error;
  }
}
