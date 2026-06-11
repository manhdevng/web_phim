"use client";

import { useState, useCallback } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AddToWatchlistButtonProps {
  movieId: string;
  initialWatchlisted?: boolean;
}

export default function AddToWatchlistButton({
  movieId,
  initialWatchlisted = false,
}: AddToWatchlistButtonProps) {
  const [isWatchlisted, setIsWatchlisted] = useState(initialWatchlisted);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleToggle = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    setIsPending(true);

    try {
      if (isWatchlisted) {
        const { error } = await supabase
          .from("watchlists")
          .delete()
          .eq("user_id", user.id)
          .eq("movie_id", movieId);

        if (error) throw error;
        setIsWatchlisted(false);
      } else {
        const { error } = await supabase
          .from("watchlists")
          .upsert(
            { user_id: user.id, movie_id: movieId },
            { onConflict: "user_id,movie_id", ignoreDuplicates: true }
          );

        if (error) throw error;
        setIsWatchlisted(true);
      }
    } catch (err) {
      console.error("[AddToWatchlistButton] Error:", err);
    } finally {
      setIsPending(false);
      router.refresh();
    }
  }, [movieId, isWatchlisted, router]);

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`flex items-center gap-2 px-6 py-3.5 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 ${
        isWatchlisted
          ? "bg-cinema-gold/20 text-cinema-gold border border-cinema-gold/40"
          : "bg-white/10 backdrop-blur-xl text-white border border-white/10 hover:bg-white/20"
      }`}
    >
      {isWatchlisted ? (
        <BookmarkCheck className="w-5 h-5" />
      ) : (
        <Bookmark className="w-5 h-5" />
      )}
      <span className="text-sm">
        {isWatchlisted ? "Đã lưu" : "Lưu vào Watchlist"}
      </span>
    </button>
  );
}
