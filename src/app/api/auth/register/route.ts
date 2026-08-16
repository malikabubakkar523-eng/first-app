import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        phone: phone || null,
        role: "CUSTOMER",
      },
    });

    // Create in-app welcome notification
    await db.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to VELOCE",
        message: "Your private membership is now active. Enjoy 20% off your first acquisition with code VELOCE20.",
        type: "SYSTEM",
        isRead: false,
      },
    });

    // Trigger transactional welcome email asynchronously
    sendWelcomeEmail({ email: cleanEmail, name: user.name }).catch((err) => {
      console.error("Welcome email background dispatch error:", err);
    });

    // Set authenticated session cookie
    await setSessionCookie({
      id: user.id,
      name: user.name,
      email: user.email,
      role: "CUSTOMER",
      avatar: null,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error", error);
    return NextResponse.json({ error: "Failed to register account." }, { status: 500 });
  }
}
