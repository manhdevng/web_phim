"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Loader2, Pin, Send, User, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface CommentSectionProps {
  movieId: string;
}

type CommentItem = {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
  is_admin: boolean;
  is_pinned: boolean;
};

type RawComment = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_admin: boolean | null;
  is_pinned: boolean | null;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
};

function formatCommentTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "U";
}

export default function CommentSection({ movieId }: CommentSectionProps) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: commentsError } = await supabase
        .from("comments")
        .select("id, user_id, content, created_at, is_admin, is_pinned")
        .eq("movie_id", movieId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);

      if (commentsError) throw commentsError;

      const rawComments = (data ?? []) as RawComment[];
      const userIds = Array.from(new Set(rawComments.map((item) => item.user_id)));
      const profileMap = new Map<string, string>();

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("comment_profiles")
          .select("id, display_name")
          .in("id", userIds);

        ((profiles ?? []) as ProfileRow[]).forEach((profile) => {
          if (profile.display_name) {
            profileMap.set(profile.id, profile.display_name);
          }
        });
      }

      setComments(
        rawComments.map((item) => ({
          id: item.id,
          user_id: item.user_id,
          user_name: profileMap.get(item.user_id) ?? "Thành viên PhimHayViet",
          content: item.content,
          created_at: item.created_at,
          is_admin: Boolean(item.is_admin),
          is_pinned: Boolean(item.is_pinned),
        }))
      );
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Không tải được bình luận.";
      setError(message);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = comment.trim();
    if (!content) return;

    setIsSending(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/auth?next=/movies/${movieId}`);
        return;
      }

      const { error: insertError } = await supabase.from("comments").insert({
        movie_id: movieId,
        user_id: user.id,
        content,
      });

      if (insertError) throw insertError;

      setComment("");
      await fetchComments();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Không gửi được bình luận.";
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="flex flex-col gap-8 py-10">
      <div className="flex items-center justify-between border-b border-cinema-redlight/20 pb-4">
        <h2 className="font-playfair text-2xl text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-cinema-gold" />
          Bình luận
        </h2>
        <span className="text-white/40 text-sm font-inter">{comments.length} bình luận</span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4 items-start">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
          <User className="w-5 h-5 text-white/60" />
        </div>
        <div className="flex-1 relative group">
          <input
            type="text"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Thêm bình luận..."
            className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 pr-14 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cinema-gold/50 focus:bg-white/10 transition-all duration-300"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !comment.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-cinema-gold/20 text-cinema-gold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Gửi bình luận"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="py-12 flex items-center justify-center text-stone-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-cinema-gold" />
            Đang tải bình luận...
          </div>
        ) : comments.length > 0 ? (
          comments.map((item) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={item.id}
              className={`flex gap-4 p-4 rounded-2xl transition-all duration-300 ${
                item.is_pinned
                  ? "bg-cinema-gold/5 border border-cinema-gold/20"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${
                  item.is_admin ? "bg-cinema-gold border-cinema-gold" : "bg-white/10 border-white/10"
                }`}
              >
                {item.is_admin ? (
                  <span className="text-black font-black text-xs">LM</span>
                ) : (
                  <span className="text-white/70 text-xs font-bold">{getInitials(item.user_name)}</span>
                )}
              </div>

              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-sm font-bold ${item.is_admin ? "text-cinema-gold" : "text-white/80"}`}>
                    {item.user_name}
                  </span>
                  {item.is_pinned && (
                    <span className="flex items-center gap-1 text-[10px] text-cinema-gold uppercase font-black tracking-tighter">
                      <Pin className="w-3 h-3 fill-cinema-gold" />
                      Đã ghim
                    </span>
                  )}
                  <span className="text-[10px] text-white/30 font-medium">
                    {formatCommentTime(item.created_at)}
                  </span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed font-inter break-words">
                  {item.content}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-12 text-center rounded-2xl border border-white/5 bg-white/[0.03]">
            <p className="text-white/60 text-sm">Chưa có bình luận nào cho phim này.</p>
          </div>
        )}
      </div>
    </section>
  );
}
