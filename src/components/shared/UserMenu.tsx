"use client";

import { LogOut, User, History, ChevronDown, Settings, Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function UserMenu({ userName, userEmail }: { userName: string; userEmail?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get initials (e.g. "Nguyễn Ngọc Mạnh" → "NM")
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  const menuItems = [
    {
      label: "Thông tin cá nhân",
      icon: <User className="w-4 h-4" />,
      href: "/profile",
    },
    {
      label: "Lịch sử xem phim",
      icon: <History className="w-4 h-4" />,
      href: "/profile/history",
    },
    {
      label: "Phim yêu thích",
      icon: <Bookmark className="w-4 h-4" />,
      href: "/profile/watchlist",
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-white/10 transition-all duration-200 group"
        aria-label="Tài khoản"
      >
        {/* Avatar circle with initials */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-700 border-2 border-amber-400/50 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_12px_rgba(212,175,55,0.4)] group-hover:shadow-[0_0_18px_rgba(212,175,55,0.6)] transition-all">
          {initials || <User className="w-4 h-4" />}
        </div>
        <ChevronDown
          className={`w-3 h-3 text-white/50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+12px)] w-60 rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.7)] z-50"
          style={{
            background: "rgba(10, 8, 6, 0.85)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* User Info Header */}
          <div className="px-4 py-4 flex items-center gap-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-700 border-2 border-amber-400/40 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-[0_0_12px_rgba(212,175,55,0.3)]">
              {initials || <User className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white/95 truncate leading-tight">{userName}</p>
              {userEmail && (
                <p className="text-xs text-white/40 truncate mt-0.5 leading-tight">{userEmail}</p>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/8 transition-all duration-150 group"
              >
                <span className="text-amber-400/70 group-hover:text-amber-400 transition-colors">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Divider + Sign Out */}
          <div className="p-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 disabled:opacity-50 group"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
