"use client";

import React, { useState } from "react";
import { Play, AlertCircle, Film, Lock, Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getYouTubeId } from "@/utils/video";
import { getTmdbImageUrl } from "@/utils/tmdb";
import { createClient } from "@/lib/supabase/client";

interface MoviePlayerProps {
  url: string;
  title: string;
  poster?: string;
  tmdbId?: string;
  isLoggedIn?: boolean;
  isPremium?: boolean;
  badge?: string | null;
}

const SERVERS = [
  { id: "server1", name: "VidSrc", getUrl: (id: string) => `https://vidsrc.me/embed/movie/${id}` },
  { id: "server2", name: "AutoEmbed", getUrl: (id: string) => `https://player.autoembed.cc/embed/movie/${id}` },
  { id: "server3", name: "Smashy", getUrl: (id: string) => `https://embed.smashystream.com/playere.php?tmdb=${id}` },
];

export default function MoviePlayer({ 
  url, 
  title, 
  poster, 
  tmdbId,
  isLoggedIn = false,
  isPremium = false,
  badge
}: MoviePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<"movie" | "trailer">("movie");
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [serverIndex, setServerIndex] = useState(0);
  const [isReported, setIsReported] = useState(false);
  const router = useRouter();

  const videoId = getYouTubeId(url || "");

  // Tự động tách lấy ID số từ chuỗi tmdb-12345
  const numericId = tmdbId?.startsWith("tmdb-") ? tmdbId.replace("tmdb-", "") : tmdbId;
  const isValidTmdbId = numericId && /^\d+$/.test(numericId);
  
  // NẾU không có ID TMDB chuẩn, ta fallback về youtube embed (nếu url chứa videoId)
  const fullMovieUrl = isValidTmdbId 
    ? SERVERS[serverIndex].getUrl(numericId)
    : (videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1` : null);

  const trailerUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1` : null;

  const recordWatchHistory = async () => {
    if (!tmdbId) return;

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const watchedAt = new Date().toISOString();
      const { data: existing } = await supabase
        .from("watch_history")
        .select("id, progress_seconds")
        .eq("user_id", user.id)
        .eq("movie_id", tmdbId)
        .maybeSingle();

      if (existing?.id) {
        await supabase
          .from("watch_history")
          .update({
            progress_seconds: Math.max(existing.progress_seconds ?? 0, 1),
            last_watched_at: watchedAt,
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("watch_history").insert({
          user_id: user.id,
          movie_id: tmdbId,
          progress_seconds: 1,
          last_watched_at: watchedAt,
        });
      }
    } catch (error) {
      console.error("[MoviePlayer] Failed to record watch history:", error);
    }
  };

  const handlePlayClick = async () => {
    // 1. Chưa đăng nhập -> redirect /auth
    if (!isLoggedIn) {
      router.push("/auth");
      return;
    }

    // 2. Phim VIP + chưa có Premium -> Hiện popup
    if (badge === "PHIMHAYVIET VIP" && !isPremium) {
      setShowPremiumPopup(true);
      return;
    }

    // 3. Đủ điều kiện -> Phát luôn
    if (mode === "movie") {
      await recordWatchHistory();
    }
    setIsPlaying(true);
  };

  const handleReport = () => {
    setIsReported(true);
    alert("Cảm ơn bạn đã báo cáo. Quản trị viên sẽ sớm kiểm tra và cập nhật lại phim này!");
  };

  if (!videoId && !fullMovieUrl) {
    return (
      <div className="relative w-full aspect-video bg-zinc-900 flex flex-col items-center justify-center border border-white/5 overflow-hidden">
        {poster && (
          <div className="absolute inset-0 opacity-20 blur-sm">
            <Image
              src={getTmdbImageUrl(poster, "backdrop")}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}
        <div className="z-10 flex flex-col items-center gap-4 text-center p-6">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <Film className="w-8 h-8 text-white/20" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Hiện tại chưa có video cho phim này</h3>
            <p className="text-white/40 text-sm max-w-xs mx-auto">Chúng tôi đang cập nhật nguồn phim sớm nhất có thể.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black overflow-hidden group border border-white/10 shadow-2xl rounded-2xl">
      {/* Premium Upgrade Popup */}
      <AnimatePresence>
        {showPremiumPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-cinema-gold/30 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-cinema-gold/20 flex items-center justify-center mb-2">
                <Lock className="w-8 h-8 text-cinema-gold" />
              </div>
              <h3 className="font-playfair text-2xl text-white font-bold">Nâng cấp Premium</h3>
              <p className="text-stone-400 text-sm mb-4">
                Đây là nội dung độc quyền thuộc gói PHIMHAYVIET VIP. Hãy nâng cấp tài khoản để trải nghiệm chất lượng 4K Ultra HD không giới hạn.
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={() => router.push("/pricing")}
                  className="w-full py-3 bg-cinema-gold text-black rounded-full font-bold hover:bg-yellow-400 transition-colors shadow-lg"
                >
                  Nâng cấp ngay
                </button>
                <button 
                  onClick={() => setShowPremiumPopup(false)}
                  className="w-full py-3 bg-white/5 text-white rounded-full font-medium hover:bg-white/10 transition-colors"
                >
                  Để sau
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isPlaying ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center transition-all duration-500">
          {poster && (
             <Image
               src={getTmdbImageUrl(poster, "backdrop")}
               alt={title}
               fill
               className="object-cover opacity-60"
               sizes="100vw"
               priority
             />
          )}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" />
          
          <div className="z-20 flex flex-col items-center gap-8">
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayClick}
              className="w-24 h-24 rounded-full bg-cinema-gold flex items-center justify-center text-black shadow-[0_0_40px_rgba(212,175,55,0.4)] hover:shadow-[0_0_60px_rgba(212,175,55,0.6)] transition-all"
            >
              <Play className="w-10 h-10 fill-black translate-x-0.5" />
            </motion.button>

            {/* Mode Switcher Pill */}
            <div className="flex p-1 bg-black/60 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl">
              <button 
                onClick={() => setMode("movie")}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${mode === "movie" ? "bg-cinema-gold text-black" : "text-white/60 hover:text-white"}`}
              >
                XEM PHIM FULL
              </button>
              <button 
                onClick={() => setMode("trailer")}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${mode === "trailer" ? "bg-cinema-gold text-black" : "text-white/60 hover:text-white"}`}
              >
                TRAILER
              </button>
            </div>
          </div>
          
          <div className="absolute bottom-8 left-8 right-8 z-20 flex items-center justify-between">
             <span className="text-[10px] uppercase tracking-[0.4em] text-cinema-gold/80 font-black">
                {title} • CHẾ ĐỘ {mode === "movie" ? "PHIM CHÍNH" : "GIỚI THIỆU"}
             </span>
             <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] text-white/60 font-bold tracking-tighter">SERVER: READY</span>
             </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full relative">
          <iframe
            className="absolute inset-0 w-full h-full border-0"
            src={mode === "movie" ? fullMovieUrl! : trailerUrl!}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          
          {/* Top Overlays when playing */}
          <div className="absolute top-4 left-4 right-4 z-50 flex items-start justify-between pointer-events-none">
            
            {/* Left: Server Switcher & Report */}
            <div className="flex flex-col gap-2 pointer-events-auto">
              {mode === "movie" && isValidTmdbId && (
                <div className="flex items-center gap-1 p-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 opacity-60 hover:opacity-100 transition-opacity">
                  <span className="px-2 text-[10px] text-white/40 uppercase tracking-wider font-bold">Server:</span>
                  {SERVERS.map((server, idx) => (
                    <button
                      key={server.id}
                      onClick={() => setServerIndex(idx)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                        serverIndex === idx 
                          ? "bg-cinema-gold text-black" 
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {server.name}
                    </button>
                  ))}
                </div>
              )}
              
              <button 
                onClick={handleReport}
                disabled={isReported}
                className={`w-max p-1.5 px-3 backdrop-blur-md rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 opacity-60 hover:opacity-100 ${
                  isReported 
                    ? "bg-green-500/20 text-green-400 border-green-500/30 cursor-not-allowed" 
                    : "bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border-red-500/30"
                }`}
              >
                {isReported ? <span className="w-2 h-2 rounded-full bg-green-400" /> : <Flag className="w-3 h-3" />}
                {isReported ? "Đã gửi báo cáo" : "Báo lỗi phim"}
              </button>
            </div>

            {/* Right: Close Button */}
            <button 
              onClick={() => setIsPlaying(false)}
              className="p-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-full text-white/60 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all pointer-events-auto"
            >
              <AlertCircle className="w-5 h-5 rotate-45 transform" style={{ transform: 'rotate(45deg)' }} />
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
