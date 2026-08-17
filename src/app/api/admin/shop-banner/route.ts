import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { broadcastContentUpdate } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let banner = await db.shopBanner.findUnique({
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

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error("Shop banner fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shop banner." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin credentials required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      badge,
      heading,
      subtitle,
      imageUrl,
      videoUrl,
      mediaType,
      ctaText,
      ctaLink,
      isActive,
    } = body;

    const chosenMediaType = mediaType === "video" ? "video" : "image";
    const finalImageUrl = imageUrl || "/images/shop-banner.png";

    if (!heading) {
      return NextResponse.json(
        { error: "Headline is required." },
        { status: 400 }
      );
    }

    if (chosenMediaType === "video" && !videoUrl) {
      return NextResponse.json(
        { error: "Video URL or uploaded video is required for video mode." },
        { status: 400 }
      );
    }

    const banner = await db.shopBanner.upsert({
      where: { id: "default" },
      update: {
        badge: badge !== undefined ? badge : "NEW ARRIVALS • SPRING/SUMMER 2026",
        heading: heading || "FRESH STYLES. BOLD MOVES.",
        subtitle: subtitle !== undefined ? subtitle : null,
        imageUrl: finalImageUrl,
        videoUrl: videoUrl || null,
        mediaType: chosenMediaType,
        ctaText: ctaText !== undefined ? ctaText : "SHOP NEW ARRIVALS",
        ctaLink: ctaLink !== undefined ? ctaLink : "/shop?sort=newest",
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      create: {
        id: "default",
        badge: badge || "NEW ARRIVALS • SPRING/SUMMER 2026",
        heading: heading || "FRESH STYLES. BOLD MOVES.",
        subtitle: subtitle || null,
        imageUrl: finalImageUrl,
        videoUrl: videoUrl || null,
        mediaType: chosenMediaType,
        ctaText: ctaText || "SHOP NEW ARRIVALS",
        ctaLink: ctaLink || "/shop?sort=newest",
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    broadcastContentUpdate("SHOP_BANNER");

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error("Shop banner save error:", error);
    return NextResponse.json(
      { error: "Failed to save shop banner." },
      { status: 500 }
    );
  }
}
