import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const deals = await db.deal.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        success: true,
        deals,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Fetch live deals error:", error);
    return NextResponse.json(
      { error: "Failed to load deals." },
      { status: 500 }
    );
  }
}
