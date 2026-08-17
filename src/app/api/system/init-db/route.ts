import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const [userCount, productCount, categoryCount, orderCount] = await Promise.all([
      db.user.count(),
      db.product.count(),
      db.category.count(),
      db.order.count(),
    ]);

    return NextResponse.json({
      success: true,
      status: "HEALTHY",
      message: "Database connection active and persistent.",
      statistics: {
        users: userCount,
        products: productCount,
        categories: categoryCount,
        orders: orderCount,
      },
    });
  } catch (error: any) {
    console.error("Database health check error:", error);
    return NextResponse.json(
      {
        success: false,
        status: "ERROR",
        error: error.message || "Failed to reach persistent PostgreSQL database.",
      },
      { status: 500 }
    );
  }
}
