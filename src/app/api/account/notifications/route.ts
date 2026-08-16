import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.id },
      select: {
        orderNotifs: true,
        dealNotifs: true,
        promoEmails: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      preferences: {
        orderNotifs: user.orderNotifs ?? true,
        dealNotifs: user.dealNotifs ?? true,
        promoEmails: user.promoEmails ?? true,
      },
    });
  } catch (error) {
    console.error("Fetch notification preferences error:", error);
    return NextResponse.json(
      { error: "Failed to load notification preferences." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { orderNotifs, dealNotifs, promoEmails } = await req.json();

    const updated = await db.user.update({
      where: { id: session.id },
      data: {
        ...(orderNotifs !== undefined && { orderNotifs: Boolean(orderNotifs) }),
        ...(dealNotifs !== undefined && { dealNotifs: Boolean(dealNotifs) }),
        ...(promoEmails !== undefined && { promoEmails: Boolean(promoEmails) }),
      },
    });

    return NextResponse.json({
      success: true,
      preferences: {
        orderNotifs: updated.orderNotifs,
        dealNotifs: updated.dealNotifs,
        promoEmails: updated.promoEmails,
      },
      message: "Notification preferences updated successfully.",
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);
    return NextResponse.json(
      { error: "Failed to update notification preferences." },
      { status: 500 }
    );
  }
}
