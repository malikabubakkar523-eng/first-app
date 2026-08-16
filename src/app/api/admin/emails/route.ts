import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { recipientEmail: { contains: search } },
        { subject: { contains: search } },
      ];
    }

    const emails = await db.emailLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, count: emails.length, emails });
  } catch (error) {
    console.error("Fetch email logs error:", error);
    return NextResponse.json({ error: "Failed to fetch email logs." }, { status: 500 });
  }
}
