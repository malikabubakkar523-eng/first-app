import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const { recipients, subject, message, type = "ADMIN_CUSTOM" } = await req.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: "At least one recipient email is required." }, { status: 400 });
    }

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message content are required." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || "VELOCE Atelier <onboarding@resend.dev>";
    const resend = apiKey ? new Resend(apiKey.trim()) : null;

    let sentCount = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      const email = recipient.trim();
      if (!email) continue;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 40px 20px; }
              .container { max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 20px; padding: 36px; }
              .logo { font-size: 26px; font-weight: 900; letter-spacing: -1px; color: #ffffff; margin-bottom: 24px; }
              .logo span { color: #f83b3b; }
              .badge { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #f83b3b; background: rgba(248, 59, 59, 0.15); padding: 5px 12px; border-radius: 9999px; margin-bottom: 16px; }
              h1 { font-size: 20px; font-weight: 800; color: #ffffff; margin: 0 0 16px 0; }
              .content { font-size: 14px; line-height: 1.7; color: #d4d4d8; white-space: pre-wrap; margin-bottom: 24px; }
              .btn { display: inline-block; background-color: #ffffff; color: #09090b; text-decoration: none; font-weight: 700; font-size: 12px; padding: 13px 26px; border-radius: 9999px; margin-top: 10px; }
              .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #27272a; font-size: 11px; color: #71717a; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">VELOCE<span>.</span></div>
              <div class="badge">ATELIER DIRECT DISPATCH</div>
              <h1>${subject}</h1>
              <div class="content">${message}</div>
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="btn">Visit VELOCE Atelier</a>
              </div>
              <div class="footer">
                VELOCE Footwear Inc. • 888 Madison Avenue, New York, NY.<br/>
                Concierge Contact: concierge@veloce-shoes.com
              </div>
            </div>
          </body>
        </html>
      `;

      let logStatus = "SENT";
      let resendId: string | null = null;
      let logError: string | null = null;

      if (resend) {
        try {
          const res = await resend.emails.send({
            from: emailFrom,
            to: email,
            subject,
            html,
          });

          if (res.data?.id) {
            resendId = res.data.id;
            sentCount++;
          } else if (res.error) {
            logStatus = "FAILED";
            logError = res.error.message;
            errors.push(`${email}: ${res.error.message}`);
          }
        } catch (err: any) {
          logStatus = "FAILED";
          logError = err.message || "Failed to dispatch";
          errors.push(`${email}: ${logError}`);
        }
      } else {
        // Simulated in dev if key not available
        sentCount++;
      }

      // Log to EmailLog database table
      await db.emailLog.create({
        data: {
          recipientEmail: email,
          subject,
          message,
          type,
          status: logStatus,
          resendId,
          error: logError,
          sender: "Marcus Vance (Admin)",
        },
      });
    }

    return NextResponse.json({
      success: true,
      sentCount,
      total: recipients.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Admin send email error:", error);
    return NextResponse.json({ error: "Failed to process email dispatch." }, { status: 500 });
  }
}
