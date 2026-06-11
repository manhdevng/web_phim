"use client";

import React from "react";
import { Movie } from "@/types/database.types";
import PosterCard from "./PosterCard";

interface MovieGridProps {
  title: string;
  movies: Movie[];
}

export default function MovieGrid({ title, movies }: MovieGridProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-6 md:px-16">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-1 h-8 bg-cinema-gold rounded-full" />
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white tracking-tight">
              {title}
            </h1>
          </div>
          <p className="text-stone-500 text-lg"> Khám phá những tác phẩm điện ảnh xuất sắc nhất tại PhimHayViet.</p>
        </header>

        {movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
            {movies.map((movie) => (
              <PosterCard 
                key={movie.id}
                image={movie.poster_url || ""} 
                title={movie.title}
                subtitle={movie.subtitle || ""}
                badge={movie.badge || ""}
                movieId={movie.id}
                showTicketButton={true}
              />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center">
            <p className="text-stone-600 italic text-xl">Hiện chưa có phim nào trong mục này. Vui lòng quay lại sau!</p>
          </div>
        )}
      </div>
    </div>
  );
}
