"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Camera, Save, KeyRound, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

type ToastState = { type: "success" | "error"; message: string } | null;

export default function AccountInfoPage() {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [initials, setInitials] = useState("?");

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toast, setToast] = useState<ToastState>(null);

  // Load current user data
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? "");

      // Load from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, phone_number, avatar_url")
        .eq("id", user.id)
        .single();

      const name = profile?.display_name ?? user.user_metadata?.full_name ?? "";
      setDisplayName(name);
      setPhoneNumber(profile?.phone_number ?? "");
      setAvatarUrl(profile?.avatar_url ?? null);

      // Build initials
      const parts = name.trim().split(" ").filter(Boolean);
      const computed = parts.length >= 2
        ? parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
        : name.slice(0, 2).toUpperCase();
      setInitials(computed);
    };
    loadUser();
  }, [supabase]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsSaving(false); return; }

    let uploadedUrl = avatarUrl;

    // Upload avatar if a new file was selected
    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        showToast("error", `Lỗi tải ảnh: ${uploadError.message}`);
        setIsSaving(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      uploadedUrl = publicUrl;
    }

    // Upsert profile
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        display_name: displayName,
        phone_number: phoneNumber,
        avatar_url: uploadedUrl,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      showToast("error", `Cập nhật thất bại: ${profileError.message}`);
    } else {
      setAvatarUrl(uploadedUrl);
      setAvatarFile(null);
      showToast("success", "Đã lưu thông tin thành công!");
    }

    setIsSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("error", "Mật khẩu xác nhận không khớp!");
      return;
    }
    if (newPassword.length < 6) {
      showToast("error", "Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }
    setIsChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      showToast("error", `Đổi mật khẩu thất bại: ${error.message}`);
    } else {
      showToast("success", "Đổi mật khẩu thành công!");
      setShowPwModal(false);
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsChangingPw(false);
  };

  const currentAvatar = avatarPreview || avatarUrl;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="font-playfair text-3xl md:text-4xl text-white mb-2">Thông tin tài khoản</h1>
      <p className="text-stone-400 font-inter mb-8">Quản lý thông tin cá nhân và bảo mật của bạn.</p>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border backdrop-blur-xl transition-all animate-in slide-in-from-right duration-300 ${
          toast.type === "success"
            ? "bg-emerald-900/80 border-emerald-500/30 text-emerald-200"
            : "bg-rose-900/80 border-rose-500/30 text-rose-200"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="font-inter text-sm">{toast.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-700 border-2 border-amber-400/50 overflow-hidden flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              {currentAvatar ? (
                <Image src={currentAvatar} alt="Avatar" fill className="object-cover rounded-full" sizes="96px" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="text-white" size={22} />
            </div>
          </div>
          <div>
            <h3 className="text-white font-inter font-medium">Ảnh đại diện</h3>
            <p className="text-sm text-stone-400 mt-1">Nên dùng ảnh vuông, dung lượng dưới 2MB</p>
            {avatarFile && (
              <p className="text-xs text-amber-400 mt-1">Ảnh mới đã chọn, nhấn &quot;Lưu thay đổi&quot; để cập nhật</p>
            )}
          </div>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-stone-300 font-inter">Tên hiển thị</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-inter focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-stone-300 font-inter">Số điện thoại</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Chưa cập nhật"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-inter focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-stone-300 font-inter">Email (Không thể thay đổi)</label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-stone-500 font-inter cursor-not-allowed"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-stone-300 font-inter">Mật khẩu</label>
            <div className="flex gap-3">
              <input
                type="password"
                disabled
                value="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-stone-500 font-inter cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPwModal(true)}
                className="shrink-0 flex items-center gap-1.5 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-inter text-sm transition-all"
              >
                <KeyRound size={14} /> Đổi
              </button>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-900 px-8 py-3 rounded-full font-inter font-medium transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Lưu thay đổi
          </button>
        </div>
      </form>

      {/* Change Password Modal */}
      {showPwModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          onClick={() => setShowPwModal(false)}
        >
          <div
            className="bg-stone-900/90 border border-white/10 rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-playfair text-2xl text-white mb-6">Đổi mật khẩu</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-stone-300 font-inter">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-inter focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-stone-300 font-inter">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-inter focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPwModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-stone-300 font-inter transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isChangingPw}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-stone-900 rounded-full font-inter font-medium transition-all disabled:opacity-50"
                >
                  {isChangingPw ? <Loader2 size={16} className="animate-spin" /> : null}
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
