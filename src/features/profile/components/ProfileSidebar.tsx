"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, History, Bookmark, Crown, LogOut } from "lucide-react";
import type { SubscriptionTier } from "@/types/database.types";
import {
  getSubscriptionDescription,
  getSubscriptionLabel,
  isPaidSubscription,
} from "@/features/profile/subscription";

interface ProfileSidebarProps {
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt: string | null;
}

export default function ProfileSidebar({
  subscriptionTier,
  subscriptionExpiresAt,
}: ProfileSidebarProps) {
  const currentPath = usePathname();
  const hasPaidSubscription = isPaidSubscription(subscriptionTier);

  const menuItems = [
    { name: "Thông tin cá nhân", path: "/profile", icon: User },
    { name: "Lịch sử xem phim", path: "/profile/history", icon: History },
    { name: "Phim yêu thích", path: "/profile/watchlist", icon: Bookmark },
  ];

  return (
    <div className="w-full md:w-64 shrink-0 flex flex-col gap-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col gap-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-x-4 px-4 py-3 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-white/20 text-white font-medium shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  : "text-stone-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span className="whitespace-nowrap font-inter">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="bg-amber-500/10 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-6 flex flex-col gap-y-4">
        <div className="flex items-center gap-x-3 text-amber-200">
          <Crown size={20} />
          <span className="font-playfair text-lg font-medium">
            {getSubscriptionLabel(subscriptionTier)}
          </span>
        </div>
        <p className="text-sm text-stone-400 font-inter">
          {getSubscriptionDescription(subscriptionTier, subscriptionExpiresAt)}
        </p>
        <Link
          href="/pricing"
          className="w-full text-center bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 rounded-full py-2 font-inter text-sm transition-all duration-300"
        >
          {hasPaidSubscription ? "Gia hạn ngay" : "Nâng cấp ngay"}
        </Link>
      </div>

      <button className="flex items-center justify-center gap-x-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 py-3 rounded-full transition-all duration-300 font-inter mt-auto">
        <LogOut size={18} />
        <span>Đăng xuất</span>
      </button>
    </div>
  );
}
