import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const banner = await db.shopBanner.findUnique({
      where: { id: "default" },
    });

    return NextResponse.json(
      {
        success: true,
        banner: banner || {
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
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Fetch shop banner error:", error);
    return NextResponse.json(
      { error: "Failed to load shop banner." },
      { status: 500 }
    );
  }
}
