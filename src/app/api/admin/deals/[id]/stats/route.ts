import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = params;

    const totalCustomers = await db.user.count({
      where: { role: "CUSTOMER", status: "ACTIVE" },
    });

    const logs = await db.dealNotificationLog.findMany({
      where: { dealId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const inAppCount = logs.filter((l) => l.channel === "IN_APP" && l.status === "SENT").length;
    const emailSentCount = logs.filter((l) => l.channel === "EMAIL" && l.status === "SENT").length;
    const emailFailedCount = logs.filter((l) => l.channel === "EMAIL" && l.status === "FAILED").length;

    return NextResponse.json({
      success: true,
      stats: {
        totalTargeted: totalCustomers,
        inAppSent: inAppCount,
        emailSent: emailSentCount,
        emailFailed: emailFailedCount,
        totalLogs: logs.length,
      },
      logs,
    });
  } catch (error: any) {
    console.error("Deal notification stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification stats." },
      { status: 500 }
    );
  }
}
