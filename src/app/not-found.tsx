import Link from "next/link";
import { Film, Home, Search } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import SpotlightWrapper from "@/components/shared/SpotlightWrapper";

export default function NotFound() {
  return (
    <SpotlightWrapper>
      <Navbar />
      <main className="min-h-screen px-4 pt-32 pb-20 text-stone-200">
        <section className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-8 text-center backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cinema-gold/25 bg-cinema-gold/10 text-cinema-gold">
            <Film className="h-8 w-8" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cinema-gold">404</p>
          <h1 className="mt-3 font-playfair text-4xl text-white md:text-5xl">Không tìm thấy suất chiếu</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-stone-400">
            Trang hoặc bộ phim này không còn trong lịch chiếu PhimHayViet.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full bg-cinema-gold px-5 py-3 text-sm font-bold text-black hover:bg-cinema-goldglow">
              <Home className="h-4 w-4" />
              Trang chủ
            </Link>
            <Link href="/trending" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm text-white hover:bg-white/[0.1]">
              <Search className="h-4 w-4" />
              Xem phim hot
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </SpotlightWrapper>
  );
}
