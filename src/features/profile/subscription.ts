import type { SubscriptionTier } from "@/types/database.types";

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = ["Free", "Premium", "VIP"];

export function normalizeSubscriptionTier(value: unknown): SubscriptionTier {
  return SUBSCRIPTION_TIERS.includes(value as SubscriptionTier)
    ? (value as SubscriptionTier)
    : "Free";
}

export function isPaidSubscription(tier: unknown): boolean {
  const normalized = normalizeSubscriptionTier(tier);
  return normalized === "Premium" || normalized === "VIP";
}

export function getSubscriptionLabel(tier: unknown): string {
  const normalized = normalizeSubscriptionTier(tier);
  if (normalized === "VIP") return "PhimHayViet VIP";
  if (normalized === "Premium") return "PhimHayViet Premium";
  return "PhimHayViet Free";
}

export function getSubscriptionDescription(tier: unknown, expiresAt?: string | null): string {
  const normalized = normalizeSubscriptionTier(tier);

  if (normalized === "Free") {
    return "Bạn đang dùng gói miễn phí. Nâng cấp để mở khóa nội dung cao cấp.";
  }

  if (!expiresAt) {
    return "Gói cước của bạn đang hoạt động.";
  }

  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(expiresAt));

  return `Gói cước của bạn sẽ hết hạn vào ${formattedDate}.`;
}
