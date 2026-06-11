"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Info, Volume2, VolumeX, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Database } from "@/types/database.types";
import { getYouTubeId } from "@/utils/video";

type Movie = Database['public']['Tables']['movies']['Row'];

interface HeroSliderProps {
  slides?: Movie[];
}

export default function HeroSlider({ slides = [] }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mỗi khi đổi slide, tạm ẩn video trong 1.5s để che icon YouTube
  useEffect(() => {
    setShowVideo(false);
    const timer = setTimeout(() => setShowVideo(true), 1500);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(nextSlide, 35000); // 12 giây đổi slide
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  const activeMovie = slides[currentSlide] || null;

  // Log để kiểm tra dữ liệu (Phải đặt trên lệnh return)
  useEffect(() => {
    if (activeMovie) {
      console.log("[HeroSlider] Active Movie:", activeMovie.title, "Backdrop:", activeMovie.backdrop_url);
    }
  }, [activeMovie]);

  if (!isMounted || slides.length === 0 || !activeMovie) return null;

  const videoId = getYouTubeId(activeMovie.trailer_url || '');

  return (
    <section className="relative w-full h-[85vh] md:h-screen overflow-hidden bg-[#0a0a0a]">
      {/* 1. BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        {videoId && showVideo && (
          <div className="absolute inset-0 transition-opacity duration-[1000ms] ease-in-out opacity-100">
            <iframe
              key={`${videoId}-${isMuted}`}
              className="absolute top-1/2 left-1/2 w-[140vw] h-[140vh] -translate-x-1/2 -translate-y-1/2 object-cover"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${videoId}&rel=0&showinfo=0&modestbranding=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
              allow="autoplay; encrypted-media"
              title="Video Background"
              style={{ border: 'none' }}
            />
          </div>
        )}

        {/* Loading/Fallback Backdrop (Disappears when video is active) */}
        <div className={`absolute inset-0 z-10 transition-opacity duration-1000 ${showVideo && videoId ? 'opacity-0' : 'opacity-100'}`}>
          <Image
            src={activeMovie.backdrop_url || activeMovie.poster_url || "/img/placeholder-hero.jpg"}
            alt={activeMovie.title}
            fill
            className="object-cover"
            priority
          />
          {/* Overlay to keep text readable on image */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
      </div>

      {/* 2. GRADIENT OVERLAYS */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
      <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#0a0a0a]/60 via-transparent to-transparent" />

      {/* 3. CONTENT LAYER */}
      <div className="absolute inset-0 z-30 flex flex-col justify-end p-6 md:p-16 pb-24 max-w-[90vw] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-4 md:gap-6"
          >
            <div className="flex items-center gap-2">
              <span className="bg-cinema-gold text-black px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">
                PHIMHAYVIET VIP
              </span>
              <span className="text-white/60 text-xs font-medium tracking-widest uppercase">
                {activeMovie.genre?.split(',')[0]} • {activeMovie.release_year}
              </span>
            </div>

            <h1 className="font-playfair text-5xl md:text-8xl text-white font-bold tracking-tight leading-tight max-w-4xl drop-shadow-2xl">
              {activeMovie.title}
            </h1>

            <p className="text-sm md:text-lg text-white/70 max-w-xl font-normal leading-relaxed line-clamp-2 drop-shadow-lg">
              {activeMovie.description}
            </p>

            <div className="flex items-center gap-4 mt-2">
              <Link href={`/movies/${activeMovie.id}`}>
                <button className="flex items-center gap-2 px-8 py-3.5 bg-white text-black rounded-lg font-bold transition-all hover:scale-105 active:scale-95">
                  <Play className="w-5 h-5 fill-black" />
                  <span className="text-sm font-bold">Xem ngay</span>
                </button>
              </Link>

              <Link href={`/movies/${activeMovie.id}`}>
                <button className="flex items-center gap-2 px-8 py-3.5 bg-white/10 backdrop-blur-xl text-white border border-white/10 rounded-lg font-bold transition-all hover:bg-white/20 hover:scale-105 active:scale-95">
                  <Info className="w-5 h-5" />
                  <span className="text-sm font-bold">Chi tiết</span>
                </button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. CONTROLS CLUSTER */}
      <div className="absolute bottom-8 right-8 flex items-center gap-6 z-40">
        {/* Progress Indicators */}
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-0.5 rounded-full transition-all duration-700 ${i === currentSlide ? "w-8 bg-white" : "w-4 bg-white/20"
                }`}
            />
          ))}
        </div>

        {/* Navigation Group */}
        <div className="flex items-center bg-black/40 backdrop-blur-3xl rounded-full border border-white/10 p-1">
          <button
            onClick={prevSlide}
            className="p-2.5 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-[1px] h-4 bg-white/10 mx-1" />
          <button
            onClick={nextSlide}
            className="p-2.5 text-white/60 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-3.5 bg-black/40 backdrop-blur-3xl rounded-full border border-white/10 text-white hover:bg-white/10 transition-all hover:scale-110"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
    </section>
  );
}
