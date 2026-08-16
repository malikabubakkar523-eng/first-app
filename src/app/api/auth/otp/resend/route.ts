import { NextRequest, NextResponse } from "next/server";
import { generateAndSendOtp, OtpPurpose } from "@/lib/otp";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, purpose } = await req.json();

    if (!email || !purpose) {
      return NextResponse.json(
        { error: "Email and purpose are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    if (purpose !== "GOOGLE_LOGIN" && purpose !== "PASSWORD_RESET") {
      return NextResponse.json({ error: "Invalid purpose." }, { status: 400 });
    }

    const result = await generateAndSendOtp(cleanEmail, purpose as OtpPurpose);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || "Please wait before requesting a new code.",
          cooldownRemaining: result.cooldownRemaining,
        },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "A new 6-digit verification code has been dispatched.",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "Unable to resend verification code. Please try again." },
      { status: 500 }
    );
  }
}
