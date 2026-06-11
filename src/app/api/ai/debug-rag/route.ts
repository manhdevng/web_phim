import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Kiểm tra tổng số phim
    const { count: totalMovies } = await supabase
      .from("movies")
      .select("*", { count: "exact", head: true });

    // 2. Kiểm tra số phim đã có Vector (Embedding)
    const { count: syncedMovies } = await supabase
      .from("movies")
      .select("*", { count: "exact", head: true })
      .not("embedding", "is", null);

    const { data: sampleMovies } = await supabase
      .from("movies")
      .select("title, embedding")
      .limit(5);

    let testRpcResult = "Chưa test";
    let testRpcError = "";
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc("match_movies", {
        query_embedding: Array(768).fill(0),
        match_threshold: 0,
        match_count: 1,
      });

      if (rpcError) throw new Error(rpcError.message);
      testRpcResult = `Thành công! RPC trả về ${rpcData?.length ?? 0} kết quả thử.`;
    } catch (error) {
      testRpcResult = "Thất bại!";
      testRpcError = getErrorMessage(error);
    }

    let testEmbeddingResult = "Chưa test";
    let testEmbeddingError = "";
    try {
      const { generateEmbedding } = await import('@/utils/embeddings');
      const testVector = await generateEmbedding("Test kết nối Gemini API");
      testEmbeddingResult = `Thành công! Vector có ${testVector.length} chiều.`;
    } catch (error) {
      testEmbeddingResult = "Thất bại!";
      testEmbeddingError = getErrorMessage(error);
    }

    // Trả về giao diện HTML để dễ thao tác
    return new NextResponse(`
      <html>
        <head>
          <title>PhimHayViet AI Debug</title>
          <style>
            body { font-family: -apple-system, sans-serif; padding: 40px; background: #000; color: #fff; }
            .card { background: #111; border: 1px solid #333; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
            h1 { color: #f5f5f7; }
            .success { color: #32d74b; font-weight: bold; }
            .error { color: #ff453a; font-weight: bold; }
            button { background: #0a84ff; color: white; border: none; padding: 12px 24px; border-radius: 20px; font-size: 16px; cursor: pointer; font-weight: bold; transition: 0.3s; }
            button:hover { background: #0071e3; }
            button:disabled { background: #333; cursor: not-allowed; }
            #log { margin-top: 20px; padding: 15px; background: #000; border: 1px solid #333; border-radius: 8px; font-family: monospace; white-space: pre-wrap; display: none; max-height: 400px; overflow-y: auto;}
          </style>
        </head>
        <body>
          <h1>PhimHayViet AI - Trạng thái dữ liệu</h1>
          
          <div class="card">
            <h2>Thống kê Database</h2>
            <p>Tổng số phim: <b>${totalMovies}</b></p>
            <p>Số phim đã học AI (có Vector): <b class="${syncedMovies === totalMovies ? 'success' : 'error'}">${syncedMovies}</b> / ${totalMovies}</p>
            <p>Trạng thái: ${syncedMovies === totalMovies ? '<span class="success">✅ Đã hoàn tất</span>' : '<span class="error">❌ Cần đồng bộ</span>'}</p>
          </div>

          <div class="card">
            <h2>Kết nối Gemini AI (Test)</h2>
            <p>Trạng thái kết nối API Vector: <b class="${testEmbeddingResult.includes('Thành công') ? 'success' : 'error'}">${testEmbeddingResult}</b></p>
            ${testEmbeddingError ? `<p class="error">Lỗi chi tiết: ${testEmbeddingError}</p>` : ''}
          </div>

          <div class="card">
            <h2>RPC match_movies</h2>
            <p>Trạng thái: <b class="${testRpcResult.includes('Thành công') ? 'success' : 'error'}">${testRpcResult}</b></p>
            ${testRpcError ? `<p class="error">Lỗi chi tiết: ${testRpcError}</p>` : ''}
          </div>

          <div class="card">
            <h2>Mẫu dữ liệu</h2>
            <pre>${JSON.stringify(sampleMovies?.map((movie) => ({
              title: movie.title,
              has_embedding: Boolean(movie.embedding),
            })) ?? [], null, 2)}</pre>
          </div>

          <div class="card">
            <h2>Hành động</h2>
            <p>Nhấn nút bên dưới để bắt đầu quá trình "huấn luyện" (đồng bộ Vector). Quá trình này có thể mất 1-2 phút.</p>
            <button id="syncBtn" onclick="startSync()" ${syncedMovies === totalMovies ? 'disabled' : ''}>
              ${syncedMovies === totalMovies ? 'Đã đồng bộ xong' : 'Bắt đầu đồng bộ AI ngay'}
            </button>
            <div id="log">Đang khởi động quá trình đồng bộ... Vui lòng không đóng trang web.</div>
          </div>

          <script>
            async function startSync() {
              const btn = document.getElementById('syncBtn');
              const log = document.getElementById('log');
              
              btn.disabled = true;
              btn.innerText = "Đang đồng bộ... (Chờ khoảng 1 phút)";
              log.style.display = "block";
              
              try {
                const response = await fetch('/api/ai/sync-embeddings', { method: 'POST' });
                const data = await response.json();
                
                log.innerHTML = "✅ <b>Đồng bộ thành công!</b>\\n\\n";
                log.innerHTML += JSON.stringify(data, null, 2);
                btn.innerText = "Đã hoàn tất!";
                
                setTimeout(() => window.location.reload(), 3000);
              } catch (e) {
                log.innerHTML = "❌ <b>Lỗi:</b> " + e.message;
                btn.disabled = false;
                btn.innerText = "Thử lại";
              }
            }
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
