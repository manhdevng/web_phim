import { NextResponse } from "next/server";

type SummarizeRequest = {
  text?: string;
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

export async function GET() {
  return NextResponse.json({ message: "PhimHayViet AI Intelligence is active!" });
}

export async function POST(request: Request) {
  try {
    const { text } = (await request.json()) as SummarizeRequest;
    const API_KEY = (process.env.GOOGLE_GEMINI_API_KEY || "").trim();

    if (!API_KEY) {
      return NextResponse.json({ error: "Thiếu API Key" }, { status: 500 });
    }

    if (!text?.trim()) {
      return NextResponse.json({ error: "Thiếu nội dung cần tóm tắt" }, { status: 400 });
    }

    // Sử dụng Model gemini-flash-latest cho tốc độ và độ ổn định cao
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

    try {
      const prompt = `Dựa vào nội dung sau, hãy viết một đoạn giới thiệu phim bằng tiếng Việt thật hấp dẫn. Yêu cầu: Nêu rõ tổng quan phim như thế nào, nhân vật chính là ai, và nội dung cụ thể phải dựa hoàn toàn theo mô tả dưới đây:\n\n${text}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = (await response.json()) as GeminiTextResponse;

      if (response.ok) {
        const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return NextResponse.json({ summary_text: summary });
      }

      // Nếu bị lỗi Quota (429) hoặc Limit 0
      if (response.status === 429 || JSON.stringify(data).includes("limit: 0")) {
        console.warn("⚠️ [PHIMHAYVIET AI] Quota exceeded. Using smart fallback...");
        
        // GIẢI PHÁP DỰ PHÒNG: Trả về chính xác nội dung phim truyền vào nếu AI bị quá tải
        const fallbackSummary = `(Hệ thống AI đang bảo trì, dưới đây là nội dung gốc của phim)\n\n${text}`;
        
        return NextResponse.json({ 
          summary_text: fallbackSummary,
          is_fallback: true 
        });
      }

      throw new Error(data.error?.message || "Lỗi AI");

    } catch {
      return NextResponse.json({ 
        summary_text: "Hiện tại AI đang bận xử lý dữ liệu phim. Bạn có thể xem phim ngay hoặc quay lại sau vài giây để nhận bản tóm tắt chi tiết."
      });
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown summarize error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
