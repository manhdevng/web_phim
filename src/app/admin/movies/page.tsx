import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import SpotlightWrapper from "@/components/shared/SpotlightWrapper";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkAdminAccess } from "@/features/admin/auth";
import type { Movie } from "@/types/database.types";
import AdminMoviesClient from "./AdminMoviesClient";

export const metadata = {
  title: "Admin Movies | Lumière",
};

export const dynamic = "force-dynamic";

function AdminBlocked({ title, message }: { title: string; message: string }) {
  return (
    <SpotlightWrapper>
      <Navbar />
      <main className="min-h-screen px-4 pt-32 pb-20 text-stone-200">
        <section className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-black/40 p-8 text-center backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/25 bg-rose-500/10 text-rose-300">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="font-playfair text-4xl text-white">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-400">{message}</p>
          <div className="mt-7 flex justify-center gap-3">
            <Link href="/" className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm text-white hover:bg-white/[0.1]">
              Về trang chủ
            </Link>
            <Link href="/auth?next=/admin/movies" className="rounded-full bg-cinema-gold px-5 py-3 text-sm font-bold text-black hover:bg-cinema-goldglow">
              Đăng nhập
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </SpotlightWrapper>
  );
}

export default async function AdminMoviesPage() {
  const access = await checkAdminAccess();

  if (!access.ok) {
    if (access.reason === "unauthenticated") {
      redirect("/auth?next=/admin/movies");
    }

    if (access.reason === "service_role_missing") {
      return (
        <AdminBlocked
          title="Thiếu Service Role Key"
          message="Thêm SUPABASE_SERVICE_ROLE_KEY vào .env.local, restart dev server, rồi mở lại trang admin."
        />
      );
    }

    if (access.reason === "admin_table_missing") {
      return (
        <AdminBlocked
          title="Bảng admin chưa sẵn sàng"
          message="Hãy chạy SQL mới để tạo bảng admin_users và kiểm tra SUPABASE_SERVICE_ROLE_KEY trong .env.local."
        />
      );
    }

    return (
      <AdminBlocked
        title="Không có quyền admin"
        message={`Tài khoản ${access.email ?? "hiện tại"} chưa được cấp quyền trong bảng admin_users.`}
      />
    );
  }

  let movies: Movie[] = [];
  let totalComments = 0;

  try {
    const supabase = createAdminClient();
    const [{ data: movieData, error: movieError }, { count: commentCount }] = await Promise.all([
      supabase
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("comments")
        .select("*", { count: "exact", head: true }),
    ]);

    if (movieError) throw movieError;
    movies = (movieData ?? []) as Movie[];
    totalComments = commentCount ?? 0;
  } catch (error) {
    return (
      <AdminBlocked
        title="Không tải được dữ liệu admin"
        message={error instanceof Error ? error.message : "Kiểm tra SUPABASE_SERVICE_ROLE_KEY trong .env.local."}
      />
    );
  }

  return (
    <SpotlightWrapper>
      <Navbar />
      <AdminMoviesClient movies={movies} totalComments={totalComments} adminEmail={access.email} />
      <Footer />
    </SpotlightWrapper>
  );
}
