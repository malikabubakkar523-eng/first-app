import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const banners = await db.heroBanner.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(
      {
        success: true,
        banners,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Fetch live hero banners error:", error);
    return NextResponse.json(
      { error: "Failed to load hero banners." },
      { status: 500 }
    );
  }
}
