import { Camera, Home, LayoutList, Flame, Search, LogIn } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-fit min-w-[800px] h-14 rounded-full grid grid-cols-[1fr_auto_1fr] items-center px-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl z-[100] transition-all duration-300">
      {/* Column 1 (Left - Logo) */}
      <div className="flex justify-start items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-cinema-gold/10 flex items-center justify-center border border-cinema-gold/30 group-hover:bg-cinema-gold/20 transition-colors">
            <Camera className="w-4 h-4 text-cinema-gold" strokeWidth={1.5} />
          </div>
          <span className="font-serif tracking-[0.15em] text-sm uppercase text-stone-100 hidden sm:block whitespace-nowrap">
            Lumière
          </span>
        </Link>
      </div>

      {/* Column 2 (Center - Links) */}
      <div className="flex justify-center items-center gap-x-8">
        <Link
          href="/"
          className="flex items-center gap-x-2 text-sm font-medium text-stone-200 hover:text-white transition-colors cursor-pointer group"
        >
          <Home className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={2} />
          <span className="whitespace-nowrap">Home</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-x-2 text-sm font-medium text-stone-200 hover:text-white transition-colors cursor-pointer group"
        >
          <LayoutList className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={2} />
          <span className="whitespace-nowrap">Thể loại</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-x-2 text-sm font-medium text-stone-200 hover:text-white transition-colors cursor-pointer group"
        >
          <Flame className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={2} />
          <span className="whitespace-nowrap">Phim hot</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-x-2 text-sm font-medium text-stone-200 hover:text-white transition-colors cursor-pointer group"
        >
          <Search className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={2} />
          <span className="whitespace-nowrap">Search</span>
        </Link>
      </div>

      {/* Column 3 (Right - Button) */}
      <div className="flex justify-end items-center">
        <button className="flex items-center gap-x-2 px-5 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all text-sm font-medium text-stone-200 hover:text-white shadow-sm whitespace-nowrap">
          <LogIn className="w-4 h-4" />
          <span>Đăng nhập</span>
        </button>
      </div>
    </nav>
  );
}
