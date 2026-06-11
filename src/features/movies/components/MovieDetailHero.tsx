"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Volume2, VolumeX, Star } from "lucide-react";
import type { Database } from "@/types/database.types";
import { getYouTubeId } from "@/utils/video";
import { getTmdbImageUrl } from "@/utils/tmdb";

type Movie = Database['public']['Tables']['movies']['Row'];

interface MovieDetailHeroProps {
  movie: Movie;
}

export default function MovieDetailHero({ movie }: MovieDetailHeroProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    setShowVideo(false);
    const timer = setTimeout(() => setShowVideo(true), 1500);
    return () => clearTimeout(timer);
  }, [movie.id]);

  const videoId = getYouTubeId(movie.trailer_url || '');

  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden bg-[#0a0a0a]">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        {videoId && (
          <div className={`absolute inset-0 transition-opacity duration-[1000ms] ease-in-out ${showVideo ? 'opacity-100' : 'opacity-0'}`}>
            <iframe
              key={`${videoId}-${isMuted}`}
              className="absolute top-1/2 left-1/2 w-[140vw] h-[140vh] -translate-x-1/2 -translate-y-1/2 object-cover"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${videoId}&rel=0&showinfo=0&modestbranding=1&enablejsapi=1`}
              allow="autoplay; encrypted-media"
              title="Video Background"
              style={{ border: 'none' }}
            />
          </div>
        )}

        <div className={`absolute inset-0 z-10 transition-opacity duration-1000 ${showVideo ? 'opacity-0' : 'opacity-100'}`}>
          <Image
            src={getTmdbImageUrl(movie.backdrop_url || movie.poster_url || "", "backdrop")}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Gradients */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
      <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-transparent" />

      {/* Info overlay */}
      <div className="absolute inset-0 z-30 flex flex-col justify-end p-6 md:p-16 pb-24 max-w-[90vw] mx-auto">
        <div className="flex flex-col gap-4 max-w-2xl">
          {/* Badge */}
          {movie.badge && (
            <span className="w-max bg-cinema-gold text-black px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">
              {movie.badge}
            </span>
          )}

          {/* Title */}
          <h1 className="font-playfair text-4xl md:text-7xl text-white font-bold tracking-tight leading-tight drop-shadow-2xl">
            {movie.title}
          </h1>

          {movie.subtitle && (
            <p className="text-lg text-white/60 font-light">{movie.subtitle}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
            {movie.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-cinema-gold text-cinema-gold" />
                {movie.rating}/10
              </span>
            )}
            {movie.genre && <span>{movie.genre}</span>}
            {movie.release_year && <span>{movie.release_year}</span>}
            {movie.duration && <span>{movie.duration}</span>}
          </div>

          {/* Description */}
          {movie.description && (
            <p className="text-sm md:text-base text-white/60 max-w-xl leading-relaxed line-clamp-3 drop-shadow-lg">
              {movie.description}
            </p>
          )}
        </div>
      </div>

      {/* Volume toggle */}
      {videoId && (
        <div className="absolute bottom-8 right-8 z-40">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3.5 bg-black/40 backdrop-blur-3xl rounded-full border border-white/10 text-white hover:bg-white/10 transition-all hover:scale-110"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      )}
    </section>
  );
}