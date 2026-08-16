import { Resend } from "resend";

async function testResendToUser() {
  const apiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || "VELOCE Atelier <onboarding@resend.dev>";
  const targetRecipient = "malikabubakkar523@gmail.com";

  console.log("🔑 Using Resend API Key:", apiKey ? `${apiKey.substring(0, 8)}...` : "None");
  console.log(`✉️ Sending live test email to: ${targetRecipient}`);

  const resend = new Resend(apiKey);

  try {
    const res = await resend.emails.send({
      from: emailFrom,
      to: targetRecipient,
      subject: "👟 VELOCE Atelier — Order & Live Resend Integration Verified",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 40px 20px; }
              .box { max-width: 580px; margin: 0 auto; background: #18181b; border: 1px solid #27272a; border-radius: 20px; padding: 36px; }
              .logo { font-size: 24px; font-weight: 900; color: #ffffff; margin-bottom: 20px; }
              .logo span { color: #f83b3b; }
              .badge { display: inline-block; background: rgba(248, 59, 59, 0.15); color: #f83b3b; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; }
              h1 { font-size: 20px; font-weight: 800; color: #ffffff; margin: 16px 0 8px 0; }
              p { font-size: 13px; color: #a1a1aa; line-height: 1.6; }
              .detail-card { background: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin: 20px 0; }
              .btn { display: inline-block; background: #ffffff; color: #09090b; font-weight: 700; font-size: 12px; text-decoration: none; padding: 12px 24px; border-radius: 9999px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="box">
              <div class="logo">VELOCE<span>.</span></div>
              <div class="badge">INTEGRATION ACTIVE</div>
              <h1>Resend API Successfully Connected</h1>
              <p>Your API key is active and configured. Transactional emails for registrations, orders, and real-time shipping milestones are delivering directly to your inbox.</p>
              
              <div class="detail-card">
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #71717a;">Test Order Allocation</div>
                <div style="font-size: 16px; font-weight: 900; font-family: monospace; color: #ffffff; margin-top: 4px;">#VEL-892019</div>
                <div style="font-size: 12px; color: #a1a1aa; margin-top: 6px;">Footwear: <strong>Veloce Apex Carbon Ghost (EU 42)</strong></div>
                <div style="font-size: 12px; color: #34d399; font-weight: 700; margin-top: 4px;">Courier Tracking: TRK-VELOCE-998811</div>
              </div>

              <a href="http://localhost:3000" class="btn">Open VELOCE Storefront</a>
            </div>
          </body>
        </html>
      `,
    });

    console.log("✅ Resend Response:", res);
    if (res.data?.id) {
      console.log(`🎉 Live Email Dispatched to ${targetRecipient}! Resend Email ID: ${res.data.id}`);
    } else if (res.error) {
      console.error("⚠️ Resend Error:", res.error);
    }
  } catch (err) {
    console.error("❌ Exception during Resend test:", err);
  }
}

testResendToUser();
