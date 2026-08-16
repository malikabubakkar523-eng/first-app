import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateAndSendOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;
  const loginUrl = new URL("/login", baseUrl);

  if (error) {
    loginUrl.searchParams.set(
      "error",
      error === "access_denied"
        ? "Google sign-in was cancelled."
        : "Google authentication failed. Please try again."
    );
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    loginUrl.searchParams.set("error", "Authorization code missing.");
    return NextResponse.redirect(loginUrl);
  }

  // Validate state
  const cookieStore = cookies();
  const savedState = cookieStore.get("veloce_oauth_state")?.value;
  if (!savedState || savedState !== state) {
    loginUrl.searchParams.set(
      "error",
      "Invalid or expired OAuth state. Please try signing in again."
    );
    return NextResponse.redirect(loginUrl);
  }

  // Clear state cookie
  cookieStore.set("veloce_oauth_state", "", { maxAge: 0, path: "/" });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Google token exchange error:", tokenData);
      loginUrl.searchParams.set(
        "error",
        "Failed to authenticate with Google. Please try again."
      );
      return NextResponse.redirect(loginUrl);
    }

    // Fetch verified profile
    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    const profile = await profileRes.json();

    if (!profileRes.ok || !profile.email) {
      loginUrl.searchParams.set(
        "error",
        "Could not retrieve email from Google profile."
      );
      return NextResponse.redirect(loginUrl);
    }

    // Generate 6-digit OTP and send to verified Google email
    const otpResult = await generateAndSendOtp(
      profile.email,
      "GOOGLE_LOGIN",
      {
        name: profile.name || profile.email.split("@")[0],
        avatar: profile.picture || null,
        googleId: profile.id,
      }
    );

    if (!otpResult.success) {
      loginUrl.searchParams.set(
        "error",
        otpResult.error || "Failed to dispatch verification code."
      );
      return NextResponse.redirect(loginUrl);
    }

    // Redirect to OTP verification screen WITHOUT setting session
    const verifyUrl = new URL("/verify-otp", baseUrl);
    verifyUrl.searchParams.set("email", profile.email);
    verifyUrl.searchParams.set("purpose", "GOOGLE_LOGIN");

    return NextResponse.redirect(verifyUrl);
  } catch (err: any) {
    console.error("Google OAuth callback exception:", err);
    loginUrl.searchParams.set(
      "error",
      "An unexpected error occurred during Google authentication."
    );
    return NextResponse.redirect(loginUrl);
  }
}
