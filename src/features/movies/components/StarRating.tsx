"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Star, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

interface StarRatingProps {
  movieId: string;
}

export default function StarRating({ movieId }: StarRatingProps) {
  const router = useRouter();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchRatings = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch global stats
      const { data: statsData } = await supabase
        .from("movie_rating_stats")
        .select("average_rating, total_ratings")
        .eq("movie_id", movieId)
        .single();

      if (statsData) {
        setAvgRating(statsData.average_rating || 0);
        setTotalRatings(statsData.total_ratings || 0);
      }

      // Fetch user's rating if logged in
      if (user) {
        const { data: userRatingData } = await supabase
          .from("movie_ratings")
          .select("rating")
          .eq("movie_id", movieId)
          .eq("user_id", user.id)
          .single();

        if (userRatingData) {
          setUserRating(userRatingData.rating);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải đánh giá:", error);
    } finally {
      setIsLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const handleRate = async (rating: number) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/auth?next=/movies/${movieId}`);
        return;
      }

      const { error } = await supabase
        .from("movie_ratings")
        .upsert(
          { movie_id: movieId, user_id: user.id, rating },
          { onConflict: "movie_id,user_id" }
        );

      if (error) throw error;

      setUserRating(rating);
      await fetchRatings(); // Refresh stats
    } catch (error) {
      console.error(error);
      setErrorMsg("Không thể gửi đánh giá. Có thể bạn chưa chạy lệnh SQL tạo bảng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-white/50 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Đang tải đánh giá...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1" onMouseLeave={() => setHoveredStar(null)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              disabled={isSubmitting}
              onMouseEnter={() => setHoveredStar(star)}
              onClick={() => handleRate(star)}
              className="focus:outline-none disabled:opacity-50"
              aria-label={`Đánh giá ${star} sao`}
            >
              <Star
                className={`w-6 h-6 transition-all duration-200 ${
                  (hoveredStar ?? userRating ?? 0) >= star
                    ? "fill-cinema-gold text-cinema-gold drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                    : "text-white/20 hover:text-white/40"
                }`}
              />
            </motion.button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          {totalRatings > 0 ? (
            <>
              <span className="font-bold text-white text-lg">{avgRating.toFixed(1)}</span>
              <span className="text-white/40">/ 5 ({totalRatings} đánh giá)</span>
            </>
          ) : (
            <span className="text-white/40 italic">Chưa có đánh giá</span>
          )}
        </div>
      </div>
      
      {errorMsg && <p className="text-rose-500 text-xs">{errorMsg}</p>}
      
      {userRating && (
        <p className="text-cinema-gold/70 text-xs font-medium">
          Bạn đã đánh giá {userRating} sao cho bộ phim này.
        </p>
      )}
    </div>
  );
}
