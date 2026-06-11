"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  Bot,
  Calendar,
  CheckCircle2,
  Clapperboard,
  Edit3,
  Film,
  Gauge,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import type { Movie } from "@/types/database.types";
import { getTmdbImageUrl } from "@/utils/tmdb";
import {
  createMovieAction,
  deleteMovieAction,
  regenerateMovieEmbeddingAction,
  updateMovieAction,
  type AdminActionResult,
  type AdminMoviePayload,
} from "./actions";

type MovieFormState = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  poster_url: string;
  backdrop_url: string;
  release_year: string;
  duration: string;
  rating: string;
  genre: string;
  trailer_url: string;
  badge: string;
  section: string;
};

const emptyForm: MovieFormState = {
  id: "",
  title: "",
  subtitle: "",
  description: "",
  poster_url: "",
  backdrop_url: "",
  release_year: "",
  duration: "",
  rating: "",
  genre: "",
  trailer_url: "",
  badge: "",
  section: "trending",
};

function formFromMovie(movie: Movie): MovieFormState {
  return {
    id: movie.id,
    title: movie.title,
    subtitle: movie.subtitle ?? "",
    description: movie.description ?? "",
    poster_url: movie.poster_url ?? "",
    backdrop_url: movie.backdrop_url ?? "",
    release_year: movie.release_year?.toString() ?? "",
    duration: movie.duration ?? "",
    rating: movie.rating?.toString() ?? "",
    genre: movie.genre ?? "",
    trailer_url: movie.trailer_url ?? "",
    badge: movie.badge ?? "",
    section: movie.section ?? "",
  };
}

function payloadFromForm(form: MovieFormState): AdminMoviePayload {
  return {
    id: form.id,
    title: form.title,
    subtitle: form.subtitle,
    description: form.description,
    poster_url: form.poster_url,
    backdrop_url: form.backdrop_url,
    release_year: form.release_year ? Number(form.release_year) : null,
    duration: form.duration,
    rating: form.rating ? Number(form.rating) : null,
    genre: form.genre,
    trailer_url: form.trailer_url,
    badge: form.badge,
    section: form.section,
  };
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-stone-300">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none transition focus:border-cinema-gold/60 focus:bg-white/[0.09] disabled:cursor-not-allowed disabled:text-stone-500"
      />
    </label>
  );
}

export default function AdminMoviesClient({
  movies,
  totalComments,
  adminEmail,
}: {
  movies: Movie[];
  totalComments: number;
  adminEmail: string;
}) {
  const [query, setQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<MovieFormState>(emptyForm);
  const [notice, setNotice] = useState<AdminActionResult | null>(null);
  const [pendingAction, startTransition] = useTransition();

  const sections = useMemo(() => {
    return Array.from(new Set(movies.map((movie) => movie.section).filter(Boolean))).sort() as string[];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return movies.filter((movie) => {
      const matchesSection = sectionFilter === "all" || movie.section === sectionFilter;
      const matchesQuery =
        !normalizedQuery ||
        movie.title.toLowerCase().includes(normalizedQuery) ||
        movie.genre?.toLowerCase().includes(normalizedQuery) ||
        movie.id.toLowerCase().includes(normalizedQuery);

      return matchesSection && matchesQuery;
    });
  }, [movies, query, sectionFilter]);

  const moviesWithEmbedding = movies.filter((movie) => Boolean(movie.embedding)).length;

  const openCreateModal = () => {
    setEditingMovie(null);
    setForm(emptyForm);
    setNotice(null);
    setIsModalOpen(true);
  };

  const openEditModal = (movie: Movie) => {
    setEditingMovie(movie);
    setForm(formFromMovie(movie));
    setNotice(null);
    setIsModalOpen(true);
  };

  const updateField = (field: keyof MovieFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitMovie = () => {
    startTransition(async () => {
      const result = editingMovie
        ? await updateMovieAction(editingMovie.id, payloadFromForm(form))
        : await createMovieAction(payloadFromForm(form));

      setNotice(result);
      if (result.ok) {
        setIsModalOpen(false);
      }
    });
  };

  const deleteMovie = (movie: Movie) => {
    const confirmed = window.confirm(`Xóa phim "${movie.title}" khỏi kho PhimHayViet?`);
    if (!confirmed) return;

    startTransition(async () => {
      setNotice(await deleteMovieAction(movie.id));
    });
  };

  const regenerateEmbedding = (movie: Movie) => {
    startTransition(async () => {
      setNotice(await regenerateMovieEmbeddingAction(movie.id));
    });
  };

  return (
    <div className="min-h-screen px-4 md:px-8 pt-32 pb-20 text-stone-200">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/35 px-6 py-7 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.35)] md:px-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cinema-gold/70 to-transparent" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cinema-gold/30 bg-cinema-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-cinema-gold">
                <Clapperboard className="h-4 w-4" />
                Admin Studio
              </div>
              <h1 className="font-playfair text-4xl text-white md:text-6xl">
                Quản trị nội dung phim
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-400 md:text-base">
                Điều phối kho phim PhimHayViet, chỉnh metadata, poster, phân mục và dữ liệu AI trong một không gian quản trị liquid glass.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
              <span className="text-xs uppercase tracking-[0.2em] text-stone-500">Signed in as</span>
              <span className="text-sm font-medium text-white">{adminEmail}</span>
              <Link href="/" className="text-xs text-cinema-gold hover:text-cinema-goldglow">
                Mở trang người dùng
              </Link>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Stat label="Tổng phim" value={movies.length.toString()} icon={<Film className="h-5 w-5" />} />
          <Stat label="Section" value={sections.length.toString()} icon={<Gauge className="h-5 w-5" />} />
          <Stat label="Có AI vector" value={`${moviesWithEmbedding}/${movies.length}`} icon={<Bot className="h-5 w-5" />} />
          <Stat label="Bình luận" value={totalComments.toString()} icon={<Star className="h-5 w-5" />} />
        </section>

        {notice && (
          <div
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm backdrop-blur-xl ${
              notice.ok
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                : "border-rose-500/25 bg-rose-500/10 text-rose-200"
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
            {notice.message}
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-black/35 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm theo tên phim, thể loại, ID..."
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] pl-11 pr-4 text-sm text-white outline-none transition focus:border-cinema-gold/60"
                />
              </div>
              <select
                value={sectionFilter}
                onChange={(event) => setSectionFilter(event.target.value)}
                className="h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none transition focus:border-cinema-gold/60"
              >
                <option className="bg-zinc-950" value="all">Tất cả section</option>
                {sections.map((section) => (
                  <option className="bg-zinc-950" key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-cinema-gold px-5 text-sm font-bold text-black transition hover:bg-cinema-goldglow"
            >
              <Plus className="h-4 w-4" />
              Thêm phim
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-stone-500">
                <tr className="border-b border-white/10">
                  <th className="px-5 py-4 font-medium">Phim</th>
                  <th className="px-5 py-4 font-medium">Section</th>
                  <th className="px-5 py-4 font-medium">Meta</th>
                  <th className="px-5 py-4 font-medium">AI</th>
                  <th className="px-5 py-4 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovies.map((movie) => (
                  <tr key={movie.id} className="border-b border-white/5 transition hover:bg-white/[0.04]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-20 w-14 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                          {movie.poster_url ? (
                            <Image src={getTmdbImageUrl(movie.poster_url, "poster")} alt={movie.title} fill className="object-cover" sizes="56px" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-stone-600">
                              <ImageIcon className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">{movie.title}</p>
                          <p className="mt-1 truncate text-xs text-stone-500">{movie.id}</p>
                          <p className="mt-2 line-clamp-1 max-w-md text-xs text-stone-400">{movie.genre || "Chưa có thể loại"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-cinema-gold/25 bg-cinema-gold/10 px-3 py-1 text-xs text-cinema-gold">
                        {movie.section || "none"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-stone-400">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {movie.release_year || "N/A"}
                        </span>
                        <span>{movie.duration || "Chưa có thời lượng"}</span>
                        <span>{movie.rating ? `${movie.rating}/10` : "Chưa có điểm"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs ${movie.embedding ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" : "bg-rose-500/10 text-rose-300 border border-rose-500/20"}`}>
                        {movie.embedding ? "Synced" : "Missing"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(movie)} className="rounded-xl border border-white/10 bg-white/[0.06] p-2 text-stone-300 transition hover:border-cinema-gold/40 hover:text-cinema-gold" aria-label="Sửa phim">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button disabled={pendingAction} onClick={() => regenerateEmbedding(movie)} className="rounded-xl border border-white/10 bg-white/[0.06] p-2 text-stone-300 transition hover:border-cinema-gold/40 hover:text-cinema-gold disabled:opacity-50" aria-label="Tạo lại embedding">
                          <Bot className="h-4 w-4" />
                        </button>
                        <button disabled={pendingAction} onClick={() => deleteMovie(movie)} className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50" aria-label="Xóa phim">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMovies.length === 0 && (
            <div className="px-5 py-16 text-center text-stone-500">
              Không tìm thấy phim phù hợp.
            </div>
          )}
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950/80 shadow-[0_40px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-zinc-950/80 px-6 py-5 backdrop-blur-2xl">
              <div>
                <h2 className="font-playfair text-3xl text-white">
                  {editingMovie ? "Chỉnh sửa phim" : "Thêm phim mới"}
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Metadata sẽ được lưu vào Supabase bằng server action.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full border border-white/10 bg-white/[0.06] p-2 text-stone-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
              <Field label="ID phim" value={form.id} disabled={Boolean(editingMovie)} onChange={(value) => updateField("id", value)} placeholder="Để trống sẽ tự tạo ID" />
              <Field label="Tên phim" value={form.title} onChange={(value) => updateField("title", value)} placeholder="Tên hiển thị" />
              <Field label="Phụ đề" value={form.subtitle} onChange={(value) => updateField("subtitle", value)} placeholder="2026 • Drama" />
              <Field label="Section" value={form.section} onChange={(value) => updateField("section", value)} placeholder="trending, action, vietnamese..." />
              <Field label="Poster URL" value={form.poster_url} onChange={(value) => updateField("poster_url", value)} placeholder="https://..." />
              <Field label="Backdrop URL" value={form.backdrop_url} onChange={(value) => updateField("backdrop_url", value)} placeholder="https://..." />
              <Field label="Năm phát hành" type="number" value={form.release_year} onChange={(value) => updateField("release_year", value)} />
              <Field label="Thời lượng" value={form.duration} onChange={(value) => updateField("duration", value)} placeholder="2h 10m" />
              <Field label="Điểm đánh giá" type="number" value={form.rating} onChange={(value) => updateField("rating", value)} placeholder="8.5" />
              <Field label="Badge" value={form.badge} onChange={(value) => updateField("badge", value)} placeholder="PHIMHAYVIET VIP, Hot..." />
              <Field label="Thể loại" value={form.genre} onChange={(value) => updateField("genre", value)} placeholder="Action, Drama" />
              <Field label="Trailer URL" value={form.trailer_url} onChange={(value) => updateField("trailer_url", value)} placeholder="YouTube URL" />
              <label className="md:col-span-2 flex flex-col gap-2 text-sm text-stone-300">
                <span>Mô tả</span>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  rows={5}
                  className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition focus:border-cinema-gold/60 focus:bg-white/[0.09]"
                  placeholder="Nội dung phim..."
                />
              </label>
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-white/10 bg-zinc-950/80 px-6 py-5 backdrop-blur-2xl">
              <button onClick={() => setIsModalOpen(false)} className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm text-stone-300 hover:bg-white/[0.1]">
                Hủy
              </button>
              <button
                onClick={submitMovie}
                disabled={pendingAction}
                className="inline-flex items-center gap-2 rounded-full bg-cinema-gold px-6 py-3 text-sm font-bold text-black transition hover:bg-cinema-goldglow disabled:opacity-60"
              >
                {pendingAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Lưu phim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-cinema-gold/25 bg-cinema-gold/10 text-cinema-gold">
        {icon}
      </div>
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">{label}</p>
    </div>
  );
}
