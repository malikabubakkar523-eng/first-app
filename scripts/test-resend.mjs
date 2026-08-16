import { Resend } from "resend";

async function testResend() {
  const apiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || "VELOCE Atelier <onboarding@resend.dev>";

  console.log("🔑 Loaded Resend API Key:", apiKey ? `${apiKey.substring(0, 8)}...` : "None");
  console.log("✉️ Sender Address:", emailFrom);

  const resend = new Resend(apiKey);

  try {
    const res = await resend.emails.send({
      from: emailFrom,
      to: "delivered@resend.dev",
      subject: "VELOCE — Resend API Integration Verified",
      html: `
        <div style="font-family: sans-serif; background: #09090b; color: #ffffff; padding: 30px; border-radius: 12px;">
          <h1 style="color: #f83b3b; margin: 0 0 10px 0;">VELOCE FOOTWEAR</h1>
          <p>This is a live transactional email sent via your configured Resend API key.</p>
          <p>Orders, registrations, and shipping status updates are now delivering directly into customer inboxes.</p>
        </div>
      `,
    });

    console.log("✅ Resend API Response:", res);
    if (res.data?.id) {
      console.log(`🎉 SUCCESS! Email dispatched with ID: ${res.data.id}`);
    } else if (res.error) {
      console.error("⚠️ Resend returned error:", res.error);
    }
  } catch (err) {
    console.error("❌ Exception during Resend test:", err);
  }
}

testResend();
