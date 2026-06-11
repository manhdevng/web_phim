import React from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import SpotlightWrapper from "@/components/shared/SpotlightWrapper";
import ProfileSidebar from "@/features/profile/components/ProfileSidebar";
import { createClient } from "@/lib/supabase/server";
import { normalizeSubscriptionTier } from "@/features/profile/subscription";

export const metadata = {
  title: "Thông tin cá nhân | Lumière",
};

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("subscription_tier, subscription_expires_at")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <SpotlightWrapper>
      <Navbar />
      <div className="min-h-screen px-4 md:px-8 py-8 md:py-28 max-w-[90vw] mx-auto flex flex-col md:flex-row gap-8">
        <ProfileSidebar
          subscriptionTier={normalizeSubscriptionTier(profile?.subscription_tier)}
          subscriptionExpiresAt={profile?.subscription_expires_at ?? null}
        />
        <main className="flex-1">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 min-h-[600px]">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </SpotlightWrapper>
  );
}
