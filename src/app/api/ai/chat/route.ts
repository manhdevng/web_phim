import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/utils/embeddings";

type ChatRequest = {
  message?: string;
};

type MatchedMovie = {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  similarity: number;
};

type GeminiTextResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

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

/**
 * Route: POST /api/ai/chat
 * Mục đích: Chatbot thông minh tìm kiếm phim sử dụng RAG.
 */
export async function POST(request: Request) {
  try {
    const { message } = (await request.json()) as ChatRequest;
    const API_KEY = process.env.GOOGLE_GEMINI_API_KEY || "";

    if (!message) {
      return NextResponse.json({ error: "Vui lòng nhập câu hỏi" }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Tạo embedding cho câu hỏi của người dùng
    const queryEmbedding = await generateEmbedding(message);

    // 2. Tìm kiếm các phim liên quan nhất trong Database (Sử dụng hàm match_movies RPC)
    const { data: matchedMovies, error: matchError } = await supabase.rpc("match_movies", {
      query_embedding: queryEmbedding,
      match_threshold: 0.05,
      match_count: 12,
    });

    if (matchError) {
      console.error("[LUMIÈRE AI] Match error:", matchError.message);
      return NextResponse.json({
        error: "Chưa thể tìm kiếm bằng AI. Hãy kiểm tra SQL pgvector và hàm match_movies trong Supabase.",
        details: matchError.message,
      }, { status: 500 });
    }

    const movies = (matchedMovies ?? []) as MatchedMovie[];

    if (movies.length === 0) {
      return NextResponse.json({
        answer: "Mình chưa tìm thấy phim phù hợp trong kho Lumière. Bạn có thể thử mô tả rõ hơn về thể loại, diễn viên hoặc nội dung muốn xem.",
        movies: [],
      });
    }

    // 3. Chuẩn bị ngữ cảnh cho AI
    const context = movies.map((movie) => 
      `- ID: ${movie.id} | Phim: ${movie.title} | Thể loại: ${movie.genre || "N/A"} | Điểm liên quan: ${movie.similarity.toFixed(3)} | Mô tả: ${movie.description || "Chưa có mô tả"}`
    ).join("\n") || "Không tìm thấy phim nào trong database.";

    // 4. Gửi cho Gemini để trả lời dựa trên ngữ cảnh
    const prompt = `Bạn là Lumière Assistant - Trợ lý AI đặc biệt tại rạp Lumière Cinema.
Dưới đây là các phim hiện có trong kho Lumière:

${context}

Yêu cầu trả lời:
1. Chỉ gợi ý phim trong danh sách trên, không bịa phim ngoài kho.
2. Trả lời bằng tiếng Việt, ngắn gọn, tự nhiên.
3. Nếu đề xuất phim, luôn kèm link nội bộ theo định dạng Markdown: [Xem phim {Tên phim}](/movies/{ID}).
4. Nếu phim không khớp hoàn toàn, nói rõ đây là gợi ý gần nhất.

Câu hỏi của người dùng: "${message}"`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = (await response.json()) as GeminiTextResponse;

    if (response.ok) {
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return NextResponse.json({
        answer: answer || "Mình tìm được phim phù hợp nhưng chưa tạo được câu trả lời AI.",
        movies,
      });
    }

    throw new Error(data.error?.message || "Lỗi AI");

  } catch (error: unknown) {
    console.error("[LUMIÈRE AI] Chat error:", error);
    const message = error instanceof Error ? error.message : "Unknown AI error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
