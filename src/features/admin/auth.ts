import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminCheckResult =
  | { ok: true; email: string; role: string }
  | { ok: false; reason: "unauthenticated" | "service_role_missing" | "admin_table_missing" | "forbidden"; email?: string };

export async function checkAdminAccess(): Promise<AdminCheckResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { ok: false, reason: "unauthenticated" };
  }

  try {
    const adminSupabase = createAdminClient();
    const normalizedEmail = user.email.trim().toLowerCase();
    const { data: adminByUserId, error: userIdError } = await adminSupabase
      .from("admin_users")
      .select("role, active")
      .eq("user_id", user.id)
      .maybeSingle();

    if (userIdError) {
      console.error("[AdminAccess] Failed to check admin_users by user_id:", userIdError.message);
      return { ok: false, reason: "admin_table_missing", email: user.email };
    }

    const { data: adminByEmail, error: emailError } = adminByUserId
      ? { data: null, error: null }
      : await adminSupabase
          .from("admin_users")
          .select("role, active")
          .eq("email", normalizedEmail)
          .maybeSingle();

    if (emailError) {
      console.error("[AdminAccess] Failed to check admin_users by email:", emailError.message);
      return { ok: false, reason: "admin_table_missing", email: user.email };
    }

    const adminUser = adminByUserId ?? adminByEmail;
    if (!adminUser?.active) {
      return { ok: false, reason: "forbidden", email: user.email };
    }

    return { ok: true, email: user.email, role: adminUser.role };
  } catch (error) {
    console.error("[AdminAccess] Failed to create admin client:", error);
    if (error instanceof Error && error.message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return { ok: false, reason: "service_role_missing", email: user.email };
    }
    return { ok: false, reason: "admin_table_missing", email: user.email };
  }
}

export async function assertAdminAccess() {
  const access = await checkAdminAccess();

  if (!access.ok) {
    if (access.reason === "admin_table_missing") {
      throw new Error("Bảng admin_users chưa sẵn sàng hoặc thiếu SUPABASE_SERVICE_ROLE_KEY.");
    }
    if (access.reason === "service_role_missing") {
      throw new Error("Thiếu SUPABASE_SERVICE_ROLE_KEY trong .env.local.");
    }
    if (access.reason === "unauthenticated") {
      throw new Error("Bạn cần đăng nhập để sử dụng trang admin.");
    }
    throw new Error("Tài khoản này chưa được cấp quyền admin trong database.");
  }

  return access;
}
