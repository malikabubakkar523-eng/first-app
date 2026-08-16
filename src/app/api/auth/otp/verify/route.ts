import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyOtpCode } from "@/lib/otp";
import { setSessionCookie, hashPassword } from "@/lib/auth";
import { recordUserActivity } from "@/lib/activity";
import { sendWelcomeEmail } from "@/lib/email";
import { SignJWT } from "jose";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "veloce_super_secure_jwt_secret_key_shoes_app_2026_x89"
);

export async function POST(req: NextRequest) {
  try {
    const { email, code, purpose } = await req.json();

    if (!email || !code || !purpose) {
      return NextResponse.json(
        { error: "Email, verification code, and purpose are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verify 6-digit OTP
    const verifyResult = await verifyOtpCode(cleanEmail, code, purpose);

    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.error || "Incorrect verification code." },
        { status: 400 }
      );
    }

    if (purpose === "GOOGLE_LOGIN") {
      const userData = verifyResult.userData;

      // Find or create user
      let user = await db.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!user) {
        // Create new account
        const randomPass = crypto.randomBytes(24).toString("hex");
        const passwordHash = await hashPassword(randomPass);

        user = await db.user.create({
          data: {
            email: cleanEmail,
            name: userData?.name || cleanEmail.split("@")[0],
            passwordHash,
            role: "CUSTOMER",
            status: "ACTIVE",
            avatar: userData?.avatar || null,
            lastLoginAt: new Date(),
          },
        });

        // Send welcome email asynchronously
        sendWelcomeEmail({
          email: user.email,
          name: user.name,
        }).catch(() => {});

        await recordUserActivity({
          userId: user.id,
          email: user.email,
          action: "REGISTER",
          status: "SUCCESS",
          details: "Created new account via Google OAuth + Email OTP verification.",
        });
      } else {
        // Existing user - update lastLogin and avatar if available
        await db.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            ...(userData?.avatar && !user.avatar && { avatar: userData.avatar }),
          },
        });

        await recordUserActivity({
          userId: user.id,
          email: user.email,
          action: "LOGIN",
          status: "SUCCESS",
          details: `Signed in via Google OAuth + Email OTP as ${user.role}.`,
        });
      }

      // Establish final authenticated session
      await setSessionCookie({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as "CUSTOMER" | "ADMIN",
        avatar: user.avatar,
      });

      return NextResponse.json({
        success: true,
        redirectUrl: user.role === "ADMIN" ? "/admin" : "/",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    if (purpose === "PASSWORD_RESET") {
      // Issue a signed short-lived reset authorization token (15 mins)
      const resetToken = await new SignJWT({
        email: cleanEmail,
        authorizedFor: "PASSWORD_RESET",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(JWT_SECRET);

      return NextResponse.json({
        success: true,
        resetToken,
        message: "Email verification successful.",
      });
    }

    return NextResponse.json({ error: "Unsupported verification purpose." }, { status: 400 });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during verification. Please try again." },
      { status: 500 }
    );
  }
}
