"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#050505] px-4 pt-32 text-stone-200">
      <section className="mx-auto max-w-2xl rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-center backdrop-blur-2xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/25 bg-rose-500/10 text-rose-300">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="font-playfair text-4xl text-white">Có lỗi khi tải trang</h1>
        <p className="mt-3 text-sm text-stone-400">
          {error.message || "Hệ thống chưa thể hoàn tất yêu cầu này."}
        </p>
        <button
          onClick={reset}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-cinema-gold px-5 py-3 text-sm font-bold text-black hover:bg-cinema-goldglow"
        >
          <RotateCcw className="h-4 w-4" />
          Thử lại
        </button>
      </section>
    </main>
  );
}
