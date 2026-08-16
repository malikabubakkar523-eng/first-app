import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { broadcastContentUpdate } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const banners = await db.heroBanner.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ success: true, banners });
  } catch (error) {
    console.error("Hero banners fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero banners." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { heading, subtitle, badge, imageUrl, ctaText, ctaLink, order, isActive } = body;

    if (!heading || !imageUrl) {
      return NextResponse.json(
        { error: "Heading and Hero Image URL are required." },
        { status: 400 }
      );
    }

    const banner = await db.heroBanner.create({
      data: {
        heading,
        subtitle: subtitle || null,
        badge: badge || "SPRING / SUMMER 2026 ARCHIVE",
        imageUrl,
        ctaText: ctaText || "SHOP THE COLLECTION",
        ctaLink: ctaLink || "/shop",
        order: Number(order) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    broadcastContentUpdate("HERO");

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error("Hero banner create error:", error);
    return NextResponse.json(
      { error: "Failed to create hero banner." },
      { status: 500 }
    );
  }
}
