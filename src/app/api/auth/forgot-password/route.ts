import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateAndSendOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists without revealing existence to client
    const user = await db.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, name: true, email: true },
    });

    if (user) {
      const otpResult = await generateAndSendOtp(cleanEmail, "PASSWORD_RESET", {
        name: user.name,
      });

      if (!otpResult.success && otpResult.cooldownRemaining) {
        return NextResponse.json(
          {
            error: otpResult.error,
            cooldownRemaining: otpResult.cooldownRemaining,
          },
          { status: 429 }
        );
      }
    } else {
      // Artificial delay to prevent timing side-channel attacks
      await new Promise((r) => setTimeout(r, 450));
    }

    // Always return safe neutral message to prevent account enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists for this email, a verification code has been sent.",
      email: cleanEmail,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Unable to process request. Please try again." },
      { status: 500 }
    );
  }
}
