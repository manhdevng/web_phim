import { createClient } from "@/lib/supabase/server";
import NavbarClient from "./NavbarClient";

/**
 * Navbar (Server Component)
 * Lấy dữ liệu user từ server side và truyền vào NavbarClient để xử lý UI tương tác
 */
export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <NavbarClient user={user} />;
}
