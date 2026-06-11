import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Nếu có param next, sử dụng làm url chuyển hướng
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error("[OAuth] Exchange code error:", error.message);
    }
  }

  // Nếu có lỗi, chuyển hướng về trang auth và hiển thị tham số lỗi
  return NextResponse.redirect(`${origin}/auth?error=OAuth_failed`);
}
