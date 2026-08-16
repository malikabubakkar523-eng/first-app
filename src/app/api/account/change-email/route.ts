import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, comparePassword, setSessionCookie } from "@/lib/auth";
import { recordUserActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { newEmail, password } = await req.json();

    if (!newEmail || !password) {
      return NextResponse.json({ error: "New email and current password are required." }, { status: 400 });
    }

    const cleanNewEmail = newEmail.toLowerCase().trim();

    if (cleanNewEmail === session.email.toLowerCase()) {
      return NextResponse.json({ error: "New email is the same as current email." }, { status: 400 });
    }

    // Verify current user & password
    const user = await db.user.findUnique({ where: { id: session.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      await recordUserActivity({
        userId: session.id,
        email: session.email,
        action: "EMAIL_CHANGE",
        status: "FAILED",
        details: "Password verification failed while attempting email update.",
      });
      return NextResponse.json({ error: "Current password verification failed." }, { status: 403 });
    }

    // Check if new email is already taken
    const existing = await db.user.findUnique({ where: { email: cleanNewEmail } });
    if (existing) {
      return NextResponse.json({ error: "This email address is already in use by another account." }, { status: 409 });
    }

    const oldEmail = user.email;
    const updated = await db.user.update({
      where: { id: session.id },
      data: { email: cleanNewEmail },
    });

    await recordUserActivity({
      userId: session.id,
      email: cleanNewEmail,
      action: "EMAIL_CHANGE",
      status: "SUCCESS",
      details: `Email changed from ${oldEmail} to ${cleanNewEmail}.`,
    });

    // Refresh JWT session cookie
    await setSessionCookie({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role as "CUSTOMER" | "ADMIN",
      avatar: updated.avatar,
    });

    return NextResponse.json({
      success: true,
      email: updated.email,
      message: "Email address updated successfully.",
    });
  } catch (error) {
    console.error("Change email error:", error);
    return NextResponse.json({ error: "Failed to update email address." }, { status: 500 });
  }
}
