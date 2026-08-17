import React from "react";
import { db } from "@/lib/db";
import { AdminShopBannerManager } from "@/components/admin/AdminShopBannerManager";

export const dynamic = "force-dynamic";

export default async function AdminShopBannerPage() {
  let banner: any = null;

  try {
    banner = await db.shopBanner.findUnique({
      where: { id: "default" },
    });

    if (!banner) {
      banner = await db.shopBanner.create({
        data: {
          id: "default",
          badge: "NEW ARRIVALS • SPRING/SUMMER 2026",
          heading: "FRESH STYLES. BOLD MOVES.",
          subtitle: "Step into the new season with premium comfort and effortless style. High performance meets runway aesthetics.",
          imageUrl: "/images/shop-banner.png",
          videoUrl: null,
          mediaType: "image",
          ctaText: "SHOP NEW ARRIVALS",
          ctaLink: "/shop?sort=newest",
          isActive: true,
        },
      });
    }
  } catch (error) {
    console.warn("⚠️ AdminShopBannerPage fallback:", error);
  }

  const defaultBanner = {
    id: "default",
    badge: "NEW ARRIVALS • SPRING/SUMMER 2026",
    heading: "FRESH STYLES. BOLD MOVES.",
    subtitle: "Step into the new season with premium comfort and effortless style. High performance meets runway aesthetics.",
    imageUrl: "/images/shop-banner.png",
    videoUrl: null,
    mediaType: "image" as "image" | "video",
    ctaText: "SHOP NEW ARRIVALS",
    ctaLink: "/shop?sort=newest",
    isActive: true,
  };

  const finalBanner = banner || defaultBanner;

  const serializedBanner = {
    ...finalBanner,
    mediaType: (finalBanner.mediaType === "video" ? "video" : "image") as "image" | "video",
  };

  return (
    <div className="space-y-6">
      <AdminShopBannerManager initialBanner={serializedBanner} />
    </div>
  );
}
