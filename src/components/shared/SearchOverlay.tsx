"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Loader2, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Movie } from "@/types/database.types";
import { getTmdbImageUrl } from "@/utils/tmdb";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const searchTerm = query.trim().replace(/[,%]/g, " ");
        const { data, error } = await supabase
          .from("movies")
          .select("*")
          .or(
            `title.ilike.%${searchTerm}%,genre.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
          )
          .limit(6);

        if (error) throw error;
        setResults(data ?? []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Đóng khi nhấn Esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-3xl flex flex-col items-center pt-32 px-4 md:px-0"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-10 right-10 p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-full max-w-3xl flex flex-col gap-8">
            {/* Search Input */}
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40 group-focus-within:text-cinema-gold transition-colors" />
              <input 
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm tên phim, diễn viên, thể loại..."
                className="w-full h-16 md:h-20 pl-16 pr-8 bg-white/5 border border-white/10 rounded-2xl text-xl md:text-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-cinema-gold/50 focus:bg-white/10 transition-all shadow-2xl"
              />
              {isLoading && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-6 h-6 text-cinema-gold animate-spin" />
                </div>
              )}
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
              {results.map((movie) => (
                <Link 
                  key={movie.id} 
                  href={`/movies/${movie.id}`}
                  onClick={onClose}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group/item"
                >
                  <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    {movie.poster_url ? (
                      <Image
                        src={getTmdbImageUrl(movie.poster_url, "poster")}
                        alt={movie.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20 text-xs">
                        No poster
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <h3 className="text-white font-medium text-lg truncate group-hover/item:text-cinema-gold transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-white/40 text-sm">
                      {movie.release_year || "N/A"} • {movie.rating ? `${movie.rating.toFixed(1)} ⭐` : "Chưa có đánh giá"}
                    </p>
                    <div className="flex items-center gap-2 mt-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                       <Play className="w-3 h-3 text-cinema-gold fill-cinema-gold" />
                       <span className="text-[10px] text-cinema-gold font-bold uppercase tracking-widest">Xem ngay</span>
                    </div>
                  </div>
                </Link>
              ))}

              {query && !isLoading && results.length === 0 && (
                <div className="col-span-full py-20 text-center text-white/20 italic">
                  Không tìm thấy phim nào phù hợp với &quot;{query}&quot;
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
