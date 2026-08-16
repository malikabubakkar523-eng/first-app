import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, setSessionCookie } from "@/lib/auth";
import { recordUserActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { name, avatar, phone } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: session.id },
      data: {
        name: name.trim(),
        avatar: avatar !== undefined ? (avatar ? avatar.trim() : null) : undefined,
        phone: phone !== undefined ? (phone ? phone.trim() : null) : undefined,
      },
    });

    await recordUserActivity({
      userId: session.id,
      email: session.email,
      action: "PROFILE_UPDATE",
      status: "SUCCESS",
      details: "Updated account name and profile avatar.",
    });

    // Refresh JWT session cookie with new name/avatar
    await setSessionCookie({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role as "CUSTOMER" | "ADMIN",
      avatar: updated.avatar,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        avatar: updated.avatar,
        phone: updated.phone,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
