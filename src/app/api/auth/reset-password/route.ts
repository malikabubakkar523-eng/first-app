import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { recordUserActivity } from "@/lib/activity";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "veloce_super_secure_jwt_secret_key_shoes_app_2026_x89"
);

export async function POST(req: NextRequest) {
  try {
    const { email, resetToken, newPassword, confirmPassword } = await req.json();

    if (!email || !resetToken || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verify JWT reset token
    let tokenPayload: any;
    try {
      const { payload } = await jwtVerify(resetToken, JWT_SECRET);
      tokenPayload = payload;
    } catch (err) {
      return NextResponse.json(
        { error: "Your password reset session has expired. Please request a new verification code." },
        { status: 401 }
      );
    }

    if (
      !tokenPayload ||
      tokenPayload.email !== cleanEmail ||
      tokenPayload.authorizedFor !== "PASSWORD_RESET"
    ) {
      return NextResponse.json(
        { error: "Invalid password reset authorization." },
        { status: 403 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    // Cleanup OTP tokens
    await db.otpToken.deleteMany({
      where: {
        email: cleanEmail,
        purpose: "PASSWORD_RESET",
      },
    });

    await recordUserActivity({
      userId: user.id,
      email: cleanEmail,
      action: "PASSWORD_CHANGE",
      status: "SUCCESS",
      details: "Password reset completed successfully via OTP verification.",
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been updated. Please sign in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Unable to reset password. Please try again." },
      { status: 500 }
    );
  }
}
