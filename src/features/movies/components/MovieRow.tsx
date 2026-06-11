"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie } from "@/types/database.types";
import PosterCard from "./PosterCard";

interface MovieRowProps {
  title: string;
  movies: any[];
}

export default function MovieRow({ title, movies }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (movies.length === 0) return null;

  return (
    <section className="relative py-8 group/row">
      <div className="flex items-center justify-between mb-6 px-4 md:px-12">
        <h2 className="text-2xl md:text-3xl font-playfair font-bold text-white tracking-tight flex items-center gap-3">
          <span className="w-1 h-8 bg-cinema-gold rounded-full" />
          {title}
        </h2>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => scroll("left")}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll("right")}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-4 scroll-smooth"
      >
        {movies.map((movie) => (
          <div key={movie.id} className="min-w-[200px] md:min-w-[250px]">
            <PosterCard 
              image={movie.poster_url || ""} 
              title={movie.title}
              subtitle={movie.subtitle || ""}
              badge={movie.badge || ""}
              movieId={movie.id}
              rating={movie.average_rating}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
