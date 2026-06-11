import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#050505] px-4 pt-32 text-stone-200">
      <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center rounded-3xl border border-white/10 bg-black/35 p-8 text-center backdrop-blur-2xl">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-cinema-gold/25 bg-cinema-gold/10 text-cinema-gold">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
        <h1 className="font-playfair text-3xl text-white">Đang chuẩn bị suất chiếu</h1>
        <p className="mt-3 text-sm text-stone-500">Lumière đang tải dữ liệu mới nhất.</p>
      </div>
    </main>
  );
}
