import crypto from "crypto";
import { db } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";

const OTP_SECRET =
  process.env.AUTH_SECRET || "veloce_super_secure_jwt_secret_key_shoes_app_2026_x89";

const OTP_EXPIRATION_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

/**
 * Computes a secure HMAC-SHA256 hash of the 6-digit OTP code.
 */
function hashOtp(code: string): string {
  return crypto.createHmac("sha256", OTP_SECRET).update(code.trim()).digest("hex");
}

/**
 * Generates a cryptographically secure random 6-digit OTP string.
 */
function generateRandom6DigitCode(): string {
  const num = crypto.randomInt(100000, 999999);
  return num.toString();
}

export type OtpPurpose = "GOOGLE_LOGIN" | "PASSWORD_RESET";

/**
 * Generates and dispatches a 6-digit OTP code to the given email address.
 */
export async function generateAndSendOtp(
  email: string,
  purpose: OtpPurpose,
  userData?: Record<string, any>
) {
  const cleanEmail = email.toLowerCase().trim();

  // Check 60-second cooldown rate limit
  const recentToken = await db.otpToken.findFirst({
    where: {
      email: cleanEmail,
      purpose,
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentToken) {
    const elapsedSeconds = Math.floor(
      (Date.now() - new Date(recentToken.lastSentAt).getTime()) / 1000
    );
    if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
      const waitSeconds = RESEND_COOLDOWN_SECONDS - elapsedSeconds;
      return {
        success: false,
        error: `Please wait ${waitSeconds} seconds before requesting a new code.`,
        cooldownRemaining: waitSeconds,
      };
    }
  }

  // Invalidate / cleanup previous unverified tokens for this email + purpose
  await db.otpToken.deleteMany({
    where: {
      email: cleanEmail,
      purpose,
    },
  });

  // Generate 6-digit code
  const code = generateRandom6DigitCode();
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  // Store token in database
  await db.otpToken.create({
    data: {
      email: cleanEmail,
      codeHash,
      purpose,
      userData: userData ? JSON.stringify(userData) : null,
      expiresAt,
      attempts: 0,
      lastSentAt: new Date(),
    },
  });

  // Dispatch luxury email
  await sendOtpEmail({
    recipientEmail: cleanEmail,
    recipientName: userData?.name || null,
    code,
    purpose,
  });

  return {
    success: true,
    email: cleanEmail,
    expiresAt,
  };
}

/**
 * Verifies a submitted 6-digit OTP code against the database.
 */
export async function verifyOtpCode(
  email: string,
  code: string,
  purpose: OtpPurpose
) {
  const cleanEmail = email.toLowerCase().trim();
  const cleanCode = code.trim();

  if (!cleanCode || cleanCode.length !== 6) {
    return { success: false, error: "Please enter a valid 6-digit verification code." };
  }

  // Find active unverified token
  const token = await db.otpToken.findFirst({
    where: {
      email: cleanEmail,
      purpose,
      verifiedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!token) {
    return {
      success: false,
      error: "No active verification code found. Please request a new one.",
    };
  }

  // Check expiration
  if (new Date() > new Date(token.expiresAt)) {
    return {
      success: false,
      error: "Verification code has expired. Please request a new code.",
    };
  }

  // Check attempt limit
  if (token.attempts >= MAX_ATTEMPTS) {
    await db.otpToken.delete({ where: { id: token.id } });
    return {
      success: false,
      error: "Maximum attempts exceeded. This code is invalidated. Please request a new one.",
    };
  }

  // Increment attempts
  await db.otpToken.update({
    where: { id: token.id },
    data: { attempts: { increment: 1 } },
  });

  // Constant-time compare hashes
  const submittedHash = hashOtp(cleanCode);
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(submittedHash, "utf-8"),
    Buffer.from(token.codeHash, "utf-8")
  );

  if (!isMatch) {
    const attemptsLeft = MAX_ATTEMPTS - (token.attempts + 1);
    return {
      success: false,
      error:
        attemptsLeft > 0
          ? `Incorrect verification code. ${attemptsLeft} attempt(s) remaining.`
          : "Maximum attempts exceeded. Please request a new verification code.",
      attemptsLeft,
    };
  }

  // Mark token verified
  await db.otpToken.update({
    where: { id: token.id },
    data: { verifiedAt: new Date() },
  });

  let parsedUserData: Record<string, any> | null = null;
  if (token.userData) {
    try {
      parsedUserData = JSON.parse(token.userData);
    } catch (e) {
      // ignore
    }
  }

  return {
    success: true,
    email: cleanEmail,
    tokenId: token.id,
    userData: parsedUserData,
  };
}
