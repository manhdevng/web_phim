import Link from "next/link";
import { Check, Crown } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import SpotlightWrapper from "@/components/shared/SpotlightWrapper";

const plans = [
  {
    name: "Free",
    price: "0đ",
    description: "Dành cho người dùng muốn khám phá thư viện phim cơ bản.",
    features: ["Xem trailer", "Lưu phim yêu thích", "Tìm kiếm phim trong kho Lumière"],
    cta: "Bắt đầu",
    href: "/auth",
  },
  {
    name: "Premium",
    price: "79.000đ",
    description: "Mở khóa trải nghiệm xem phim đầy đủ với chất lượng cao.",
    features: ["Xem phim full", "Chất lượng 4K Ultra HD", "Không giới hạn watchlist", "Ưu tiên server ổn định"],
    cta: "Nâng cấp Premium",
    href: "/profile",
    featured: true,
  },
  {
    name: "VIP",
    price: "129.000đ",
    description: "Gói cao nhất cho nội dung độc quyền Lumière VIP.",
    features: ["Toàn bộ quyền Premium", "Nội dung LUMIÈRE VIP", "Hỗ trợ ưu tiên", "Quyền truy cập phim mới sớm"],
    cta: "Chọn VIP",
    href: "/profile",
  },
];

export const metadata = {
  title: "Gói thành viên | Lumière",
  description: "Chọn gói thành viên Lumière để mở khóa trải nghiệm xem phim cao cấp.",
};

export default function PricingPage() {
  return (
    <SpotlightWrapper>
      <Navbar />
      <main className="min-h-screen px-4 md:px-8 pt-32 pb-20">
        <section className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cinema-gold/10 border border-cinema-gold/30 text-cinema-gold text-xs font-bold uppercase tracking-widest mb-5">
              <Crown className="w-4 h-4" />
              Lumière Membership
            </div>
            <h1 className="font-playfair text-4xl md:text-6xl text-white mb-4">
              Chọn gói xem phim phù hợp
            </h1>
            <p className="text-stone-400 leading-relaxed">
              Trang này hiện xử lý luồng nâng cấp trong giao diện. Tích hợp thanh toán có thể được bổ sung ở giai đoạn subscription.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-2xl border p-6 flex flex-col gap-6 ${
                  plan.featured
                    ? "bg-cinema-gold/10 border-cinema-gold/40 shadow-[0_0_40px_rgba(212,175,55,0.12)]"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div>
                  <h2 className="font-playfair text-2xl text-white">{plan.name}</h2>
                  <p className="text-stone-400 text-sm mt-2 min-h-10">{plan.description}</p>
                </div>

                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-stone-500 pb-1">/ tháng</span>
                </div>

                <ul className="flex flex-col gap-3 text-sm text-stone-300">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-cinema-gold mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`mt-auto text-center rounded-full px-5 py-3 font-bold transition-all ${
                    plan.featured
                      ? "bg-cinema-gold text-black hover:bg-yellow-400"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                  }`}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </SpotlightWrapper>
  );
}
