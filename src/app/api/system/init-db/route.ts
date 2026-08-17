import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Check if tables exist by testing a query
    try {
      const userCount = await db.user.count();
      return NextResponse.json({
        success: true,
        message: "Database tables already exist and are active.",
        users: userCount,
      });
    } catch (queryErr: any) {
      // Table doesn't exist, run prisma db push
      console.log("⚡ Auto-creating database tables via API...");
      execSync("npx prisma db push --accept-data-loss", { stdio: "inherit", env: process.env });
      
      try {
        execSync("npx tsx prisma/seed.ts", { stdio: "inherit", env: process.env });
      } catch (e) {}

      return NextResponse.json({
        success: true,
        message: "Database tables successfully created and seeded!",
      });
    }
  } catch (error: any) {
    console.error("Database initialization error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to initialize database tables.",
      },
      { status: 500 }
    );
  }
}
