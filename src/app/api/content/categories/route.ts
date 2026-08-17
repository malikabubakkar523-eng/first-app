import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [categories, brands] = await Promise.all([
      db.category.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      db.brand.findMany({
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        categories,
        brands,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Fetch categories and brands error:", error);
    return NextResponse.json(
      {
        success: true,
        categories: [],
        brands: [],
      },
      { status: 200 }
    );
  }
}
