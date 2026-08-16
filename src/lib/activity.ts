import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function recordUserActivity({
  userId,
  email,
  action,
  status = "SUCCESS",
  details,
}: {
  userId?: string | null;
  email: string;
  action: "LOGIN" | "LOGOUT" | "REGISTER" | "PASSWORD_CHANGE" | "EMAIL_CHANGE" | "PROFILE_UPDATE";
  status?: "SUCCESS" | "FAILED";
  details?: string;
}) {
  try {
    const headersList = headers();
    const userAgent = headersList.get("user-agent") || "Unknown Device";
    const forwardedFor = headersList.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    let device = "Desktop";
    if (/mobile/i.test(userAgent)) device = "Mobile Device";
    else if (/tablet|ipad/i.test(userAgent)) device = "Tablet";

    await db.userActivity.create({
      data: {
        userId: userId || null,
        email,
        action,
        status,
        ipAddress,
        userAgent,
        device,
        details: details || null,
      },
    });
  } catch (error) {
    console.warn("Could not record user activity log:", error);
  }
}
