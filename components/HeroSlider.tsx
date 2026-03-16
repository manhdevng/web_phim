"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star, Clapperboard, PlayCircle, X } from "lucide-react";
import Image from "next/image";

interface Slide {
  image: string;
  badge: string;
  badgeIcon: "star" | "clapperboard";
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop",
    badge: "Exclusive Premiere",
    badgeIcon: "star",
    title: "The Grand Budapest",
    description:
      "A recounting of a writer's encounters with the owner of an aging high-class hotel, detailing the concierge's adventures and a stolen Renaissance painting.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2659&auto=format&fit=crop",
    badge: "Director's Cut",
    badgeIcon: "clapperboard",
    title: "Midnight in Paris",
    description:
      "While on a trip to Paris with his fiancée's family, a nostalgic screenwriter finds himself mysteriously going back to the 1920s every day at midnight.",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative w-full aspect-[4/5] md:aspect-video rounded-sm md:rounded-lg overflow-hidden reveal-element bg-zinc-900 border border-cinema-redlight/40 shadow-2xl group">
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide absolute inset-0 w-full h-full ${
              index === currentSlide ? "active" : ""
            }`}
          >
            <Image
              src={slide.image}
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
              alt={slide.title}
              fill
              sizes="100vw"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full md:w-2/3 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-cinema-gold text-xs tracking-widest uppercase">
                {slide.badgeIcon === "star" ? (
                  <Star className="w-3 h-3" />
                ) : (
                  <Clapperboard className="w-3 h-3" />
                )}
                {slide.badge}
              </div>
              <h1 className="font-serif text-4xl md:text-6xl text-white tracking-tight leading-tight">
                {slide.title}
              </h1>
              <p className="text-sm md:text-base text-stone-400 max-w-lg font-light leading-relaxed">
                {slide.description}
              </p>
              <div className="mt-4 flex items-center gap-4">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex overflow-hidden focus:outline-none h-12 rounded-full p-[1px] relative group/btn transition-transform active:scale-95"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#d4af37_50%,transparent_100%)] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700" />
                  <span className="inline-flex cursor-pointer items-center justify-center transition-colors text-sm text-stone-100 bg-cinema-red w-full h-full rounded-full px-8 backdrop-blur-3xl group-hover/btn:bg-cinema-redlight">
                    <PlayCircle className="mr-2 w-[18px] h-[18px] text-cinema-gold" />
                    Watch Trailer
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 md:bottom-12 right-6 md:right-12 flex gap-2 z-20">
        <button
          onClick={prevSlide}
          className="w-10 h-10 rounded-full border border-cinema-gold/30 flex items-center justify-center text-cinema-gold bg-cinema-base/50 backdrop-blur-sm neon-arrow transition-all duration-300 hover:bg-cinema-redlight hover:border-cinema-gold"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <button
          onClick={nextSlide}
          className="w-10 h-10 rounded-full border border-cinema-gold/30 flex items-center justify-center text-cinema-gold bg-cinema-base/50 backdrop-blur-sm neon-arrow transition-all duration-300 hover:bg-cinema-redlight hover:border-cinema-gold"
        >
          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Interactive Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/1k5Iq8kVOUc?autoplay=1"
              title="Movie Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </section>
  );
}
