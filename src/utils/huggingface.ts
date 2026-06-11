/**
 * Utility để kết nối với Hugging Face Inference API
 */

export async function queryAI(model: string, data: any) {
  const HF_TOKEN = process.env.NEXT_PUBLIC_HUGGINGFACE_TOKEN;
  
  if (!HF_TOKEN) {
    console.error("❌ [HF] Không tìm thấy NEXT_PUBLIC_HUGGINGFACE_TOKEN trong biến môi trường.");
    throw new Error("Token chưa được cấu hình.");
  }

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      headers: { Authorization: `Bearer ${HF_TOKEN}` },
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();
  return result;
}

/**
 * Tóm tắt nội dung phim
 */
export async function summarizeMovie(description: string) {
  try {
    const response = await queryAI("facebook/bart-large-cnn", {
      inputs: description,
      parameters: { max_length: 100, min_length: 30, do_sample: false },
    });

    if (Array.isArray(response) && response[0]?.summary_text) {
      return response[0].summary_text;
    }
    
    if (response.error) {
      if (response.estimated_time) {
        return `AI đang khởi động (còn khoảng ${Math.round(response.estimated_time)}s), vui lòng thử lại sau giây lát...`;
      }
      return `Lỗi AI: ${response.error}`;
    }

    return "Không nhận được phản hồi từ AI.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Lỗi kết nối hệ thống AI.";
  }
}
