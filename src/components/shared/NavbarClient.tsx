"use client";

import React, { useState, useEffect } from "react";
import { Camera, Home, LayoutList, Flame, Search, LogIn, ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import UserMenu from "./UserMenu";
import SearchOverlay from "./SearchOverlay";

import { usePathname } from "next/navigation";

interface NavbarProps {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleHomeClick = (e: React.MouseEvent) => {
    setIsMobileMenuOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  const userEmail = user?.email;

  const genres = [
    { name: "Hành động", slug: "action" },
    { name: "Tình cảm", slug: "romance" },
    { name: "Kinh dị", slug: "horror" },
    { name: "Hoạt hình", slug: "animation" },
    { name: "Viễn tưởng", slug: "sci-fi" },
    { name: "Việt Nam", slug: "vietnamese" },
  ];

  return (
    <>
      <nav 
        className={`fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[calc(100vw-1.5rem)] md:w-fit md:min-w-[850px] h-14 rounded-full grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8 z-[100] transition-all duration-500 ${
          scrolled 
          ? "bg-black/60 backdrop-blur-2xl border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
          : "bg-white/10 backdrop-blur-xl border-white/10 shadow-2xl"
        } border`}
      >
        {/* Column 1: Logo */}
        <div className="flex justify-start items-center">
          <Link href="/" onClick={handleHomeClick} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-cinema-gold/10 flex items-center justify-center border border-cinema-gold/30 group-hover:bg-cinema-gold/20 transition-colors">
              <Camera className="w-4 h-4 text-cinema-gold" strokeWidth={1.5} />
            </div>
            <span className="font-serif tracking-[0.2em] text-sm uppercase text-stone-100 hidden sm:block whitespace-nowrap drop-shadow-md">
              PhimHayViet
            </span>
          </Link>
        </div>

        {/* Column 2: Links */}
        <div className="hidden md:flex justify-center items-center gap-x-8">
          <Link
            href="/"
            onClick={handleHomeClick}
            className="flex items-center gap-x-2 text-sm font-medium text-stone-200 hover:text-white transition-all cursor-pointer group"
          >
            <Home className="w-4 h-4 group-hover:scale-110 group-hover:text-cinema-gold transition-all" />
            <span className="whitespace-nowrap">Trang chủ</span>
          </Link>

          {/* Genre Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsGenreOpen(true)}
            onMouseLeave={() => setIsGenreOpen(false)}
          >
            <button className="flex items-center gap-x-2 text-sm font-medium text-stone-200 hover:text-white transition-all cursor-pointer group">
              <LayoutList className="w-4 h-4 group-hover:scale-110 group-hover:text-cinema-gold transition-all" />
              <span className="whitespace-nowrap">Thể loại</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isGenreOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isGenreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {genres.map((g) => (
                      <Link 
                        key={g.slug} 
                        href={`/genres/${g.slug}`} 
                        className="px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      >
                        {g.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            href="/trending"
            className="flex items-center gap-x-2 text-sm font-medium text-stone-200 hover:text-white transition-all cursor-pointer group"
          >
            <Flame className="w-4 h-4 group-hover:scale-110 group-hover:text-cinema-gold transition-all" />
            <span className="whitespace-nowrap">Phim hot</span>
          </Link>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-x-2 text-sm font-medium text-stone-200 hover:text-white transition-all cursor-pointer group"
          >
            <Search className="w-4 h-4 group-hover:scale-110 group-hover:text-cinema-gold transition-all" />
            <span className="whitespace-nowrap">Tìm kiếm</span>
          </button>
        </div>

        {/* Column 3: User */}
        <div className="hidden md:flex justify-end items-center">
          {user ? (
            <UserMenu userName={userName} userEmail={userEmail} />
          ) : (
            <Link 
              href="/auth"
              className="flex items-center gap-x-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium text-stone-200 hover:text-white shadow-xl whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>

        <div className="flex md:hidden justify-end items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-stone-200"
            aria-label="Tìm kiếm"
          >
            <Search className="w-4 h-4" />
          </button>
          {user ? (
            <UserMenu userName={userName} userEmail={userEmail} />
          ) : (
            <Link
              href="/auth"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-stone-200"
              aria-label="Đăng nhập"
            >
              <LogIn className="w-4 h-4" />
            </Link>
          )}
          <button
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-stone-200"
            aria-label="Mở menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-[5.5rem] left-3 right-3 z-[90] rounded-3xl border border-white/10 bg-black/75 p-4 backdrop-blur-2xl shadow-2xl md:hidden"
          >
            <div className="grid grid-cols-2 gap-2">
              <MobileNavLink href="/" icon={<Home className="w-4 h-4" />} label="Trang chủ" onClick={handleHomeClick} />
              <MobileNavLink href="/trending" icon={<Flame className="w-4 h-4" />} label="Phim hot" onClick={() => setIsMobileMenuOpen(false)} />
            </div>
            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/30">
                <LayoutList className="w-4 h-4" />
                Thể loại
              </div>
              <div className="grid grid-cols-2 gap-2">
                {genres.map((genre) => (
                  <Link
                    key={genre.slug}
                    href={`/genres/${genre.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-stone-300"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}

function MobileNavLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: (event: React.MouseEvent) => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-stone-300"
    >
      <span className="text-cinema-gold">{icon}</span>
      {label}
    </Link>
  );
}
