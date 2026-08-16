import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, comparePassword, hashPassword } from "@/lib/auth";
import { recordUserActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmNewPassword } = await req.json();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return NextResponse.json({ error: "All password fields are required." }, { status: 400 });
    }

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json({ error: "New password and confirmation do not match." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: session.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      await recordUserActivity({
        userId: session.id,
        email: session.email,
        action: "PASSWORD_CHANGE",
        status: "FAILED",
        details: "Incorrect current password entered.",
      });
      return NextResponse.json({ error: "Current password verification failed." }, { status: 403 });
    }

    const newPasswordHash = await hashPassword(newPassword);

    await db.user.update({
      where: { id: session.id },
      data: { passwordHash: newPasswordHash },
    });

    await recordUserActivity({
      userId: session.id,
      email: session.email,
      action: "PASSWORD_CHANGE",
      status: "SUCCESS",
      details: "Password changed successfully.",
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
  }
}
