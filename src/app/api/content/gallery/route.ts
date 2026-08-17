import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CURATED_GALLERY_ITEMS } from "@/lib/galleryData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await db.galleryItem.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    const displayItems = items && items.length > 0 ? items : CURATED_GALLERY_ITEMS;

    return NextResponse.json(
      {
        success: true,
        items: displayItems,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Fetch live gallery items error:", error);
    return NextResponse.json(
      { error: "Failed to load gallery items." },
      { status: 500 }
    );
  }
}
