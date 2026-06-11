"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminAccess } from "@/features/admin/auth";
import { buildMovieEmbeddingText, generateEmbedding } from "@/utils/embeddings";

export type AdminMoviePayload = {
  id?: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  poster_url?: string | null;
  backdrop_url?: string | null;
  release_year?: number | null;
  duration?: string | null;
  rating?: number | null;
  genre?: string | null;
  trailer_url?: string | null;
  badge?: string | null;
  section?: string | null;
};

export type AdminActionResult = {
  ok: boolean;
  message: string;
};

function emptyToNull(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function slugifyTitle(title: string) {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `custom-${base || "movie"}-${Date.now()}`;
}

function normalizePayload(payload: AdminMoviePayload) {
  const title = payload.title.trim();
  if (!title) {
    throw new Error("Tên phim là bắt buộc.");
  }

  return {
    id: emptyToNull(payload.id) ?? slugifyTitle(title),
    title,
    subtitle: emptyToNull(payload.subtitle),
    description: emptyToNull(payload.description),
    poster_url: emptyToNull(payload.poster_url),
    backdrop_url: emptyToNull(payload.backdrop_url),
    release_year: payload.release_year ?? null,
    duration: emptyToNull(payload.duration),
    rating: payload.rating ?? null,
    genre: emptyToNull(payload.genre),
    trailer_url: emptyToNull(payload.trailer_url),
    badge: emptyToNull(payload.badge),
    section: emptyToNull(payload.section),
  };
}

async function maybeCreateEmbedding(movie: ReturnType<typeof normalizePayload>) {
  if (!process.env.GOOGLE_GEMINI_API_KEY) return null;
  return generateEmbedding(buildMovieEmbeddingText(movie));
}

export async function createMovieAction(payload: AdminMoviePayload): Promise<AdminActionResult> {
  try {
    await assertAdminAccess();
    const supabase = createAdminClient();
    const movie = normalizePayload(payload);
    const embedding = await maybeCreateEmbedding(movie);

    const { error } = await supabase
      .from("movies")
      .insert(embedding ? { ...movie, embedding } : movie);

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/admin/movies");
    return { ok: true, message: `Đã thêm phim "${movie.title}".` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Không thêm được phim." };
  }
}

export async function updateMovieAction(movieId: string, payload: AdminMoviePayload): Promise<AdminActionResult> {
  try {
    await assertAdminAccess();
    const supabase = createAdminClient();
    const movie = normalizePayload({ ...payload, id: movieId });
    const updatePayload = {
      title: movie.title,
      subtitle: movie.subtitle,
      description: movie.description,
      poster_url: movie.poster_url,
      backdrop_url: movie.backdrop_url,
      release_year: movie.release_year,
      duration: movie.duration,
      rating: movie.rating,
      genre: movie.genre,
      trailer_url: movie.trailer_url,
      badge: movie.badge,
      section: movie.section,
    };

    const { error } = await supabase
      .from("movies")
      .update(updatePayload)
      .eq("id", movieId);

    if (error) throw error;

    revalidatePath("/");
    revalidatePath(`/movies/${movieId}`);
    revalidatePath("/admin/movies");
    return { ok: true, message: `Đã cập nhật phim "${movie.title}".` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Không cập nhật được phim." };
  }
}

export async function deleteMovieAction(movieId: string): Promise<AdminActionResult> {
  try {
    await assertAdminAccess();
    const supabase = createAdminClient();
    const { error } = await supabase.from("movies").delete().eq("id", movieId);

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/admin/movies");
    return { ok: true, message: "Đã xóa phim." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Không xóa được phim." };
  }
}

export async function regenerateMovieEmbeddingAction(movieId: string): Promise<AdminActionResult> {
  try {
    await assertAdminAccess();
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error("Thiếu GOOGLE_GEMINI_API_KEY để tạo embedding.");
    }

    const supabase = createAdminClient();
    const { data: movie, error: fetchError } = await supabase
      .from("movies")
      .select("id, title, subtitle, description, genre, release_year")
      .eq("id", movieId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!movie) throw new Error("Không tìm thấy phim.");

    const embedding = await generateEmbedding(buildMovieEmbeddingText(movie));
    const { error } = await supabase
      .from("movies")
      .update({ embedding })
      .eq("id", movieId);

    if (error) throw error;

    revalidatePath("/admin/movies");
    return { ok: true, message: `Đã tạo lại AI embedding cho "${movie.title}".` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Không tạo được embedding." };
  }
}
