import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, setSessionCookie } from "@/lib/auth";
import { recordUserActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      await recordUserActivity({
        email: cleanEmail,
        action: "LOGIN",
        status: "FAILED",
        details: "User not found with provided email address.",
      });
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      await recordUserActivity({
        userId: user.id,
        email: cleanEmail,
        action: "LOGIN",
        status: "FAILED",
        details: "Incorrect password attempt.",
      });
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Update lastLoginAt
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Record successful login activity
    await recordUserActivity({
      userId: user.id,
      email: cleanEmail,
      action: "LOGIN",
      status: "SUCCESS",
      details: `Successful sign in as ${user.role}`,
    });

    await setSessionCookie({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "CUSTOMER" | "ADMIN",
      avatar: user.avatar,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json({ error: "Internal server error during login." }, { status: 500 });
  }
}
