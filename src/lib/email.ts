import { Resend } from "resend";
import { formatPrice, formatDate } from "@/lib/utils";
import { db } from "@/lib/db";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  return new Resend(apiKey.trim());
}

function getSender() {
  return process.env.EMAIL_FROM || "VELOCE Atelier <onboarding@resend.dev>";
}

// Log email dispatch to database for admin auditing
async function recordEmailLog({
  recipientEmail,
  recipientName,
  subject,
  message,
  type = "ORDER",
  status = "SENT",
  resendId,
  error,
}: {
  recipientEmail: string;
  recipientName?: string | null;
  subject: string;
  message?: string | null;
  type?: string;
  status?: string;
  resendId?: string | null;
  error?: string | null;
}) {
  try {
    await db.emailLog.create({
      data: {
        recipientEmail,
        recipientName: recipientName || null,
        subject,
        message: message ? message.substring(0, 500) : null,
        type,
        status,
        resendId: resendId || null,
        error: error || null,
        sender: getSender(),
      },
    });
  } catch (err) {
    console.warn("Failed to record email log:", err);
  }
}

export async function sendWelcomeEmail({ email, name }: { email: string; name: string }) {
  const resend = getResendClient();
  const emailFrom = getSender();
  const subject = "Welcome to VELOCE — Your Private Footwear Atelier Membership";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 20px; padding: 40px; }
          .logo { font-family: system-ui, -apple-system, sans-serif; font-size: 28px; font-weight: 900; font-style: italic; letter-spacing: 1.5px; color: #ffffff; margin-bottom: 24px; }
          .logo span { color: #f43f5e; }
          h1 { font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 0; }
          p { font-size: 14px; line-height: 1.6; color: #a1a1aa; }
          .card { background-color: #09090b; border: 1px solid #27272a; border-radius: 14px; padding: 20px; margin: 24px 0; text-align: center; }
          .promo-title { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #71717a; letter-spacing: 1px; }
          .promo-code { font-size: 22px; font-weight: 900; font-family: monospace; color: #f83b3b; margin: 6px 0; letter-spacing: 2px; }
          .button { display: inline-block; background-color: #ffffff; color: #09090b; text-decoration: none; font-weight: 700; font-size: 13px; padding: 14px 28px; border-radius: 9999px; margin-top: 10px; }
          .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #27272a; font-size: 12px; color: #71717a; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">VELOCE<span>.</span></div>
          <h1>Welcome to the Circle, ${name}</h1>
          <p>Your membership is now active. As a VELOCE patron, you have priority allocation access to limited carbon-propulsion marathon drops, bespoke Tuscan footwear, and complimentary global express delivery.</p>
          
          <div class="card">
            <div class="promo-title">Exclusive Member Acquisition Gift</div>
            <div class="promo-code">VELOCE20</div>
            <p style="margin: 0; font-size: 12px; color: #a1a1aa;">20% off your initial footwear acquisition during checkout</p>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shop" class="button">Explore SS26 Footwear Archive</a>
          </div>

          <div class="footer">
            &copy; 2026 VELOCE Footwear Inc. 888 Madison Avenue, New York, NY.
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.log(`[Resend Email Simulated] Welcome email to: ${email} (${name})`);
    await recordEmailLog({
      recipientEmail: email,
      recipientName: name,
      subject,
      message: "Welcome email sent (Simulated)",
      type: "ACCOUNT",
      status: "SENT",
    });
    return { success: true, simulated: true };
  }

  try {
    const result = await resend.emails.send({
      from: emailFrom,
      to: email,
      subject,
      html,
    });

    if (result.data?.id) {
      console.log(`✅ [Resend] Welcome email dispatched to ${email}. ID: ${result.data.id}`);
      await recordEmailLog({
        recipientEmail: email,
        recipientName: name,
        subject,
        message: "Welcome membership email dispatched",
        type: "ACCOUNT",
        status: "SENT",
        resendId: result.data.id,
      });
      return { success: true, id: result.data.id };
    } else {
      console.warn(`⚠️ [Resend] Notice for ${email}:`, result.error?.message);
      await recordEmailLog({
        recipientEmail: email,
        recipientName: name,
        subject,
        type: "ACCOUNT",
        status: "FAILED",
        error: result.error?.message,
      });
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    console.error(`❌ [Resend] Welcome email dispatch error for ${email}:`, error);
    await recordEmailLog({
      recipientEmail: email,
      recipientName: name,
      subject,
      type: "ACCOUNT",
      status: "FAILED",
      error: error?.message || String(error),
    });
    return { success: false, error };
  }
}

export type OrderEmailType =
  | "ORDER_PLACED"
  | "ORDER_CONFIRMED"
  | "ORDER_PROCESSING"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED";

export async function sendOrderEmail({
  order,
  type,
  customNote,
}: {
  order: any;
  type: OrderEmailType;
  customNote?: string | null;
}) {
  const resend = getResendClient();
  const emailFrom = getSender();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const titles: Record<
    OrderEmailType,
    { subject: string; headline: string; message: string; badge: string; color: string }
  > = {
    ORDER_PLACED: {
      subject: `Order #${order.orderNumber} Placed — VELOCE Atelier`,
      headline: "Your Order Has Been Received",
      message: "We have received your order and our atelier team is preparing your allocation.",
      badge: "ORDER RECEIVED",
      color: "#3b82f6",
    },
    ORDER_CONFIRMED: {
      subject: `🎉 Order #${order.orderNumber} Confirmed & Locked — VELOCE`,
      headline: "Footwear Allocation Confirmed",
      message: "Your order has been officially verified and confirmed. Your footwear allocation is now securely reserved in our warehouse vault.",
      badge: "ORDER CONFIRMED",
      color: "#10b981",
    },
    ORDER_PROCESSING: {
      subject: `📦 Order #${order.orderNumber} Under Quality Inspection — VELOCE`,
      headline: "Undergoing Hand Inspection & Packaging",
      message: "Each pair is undergoing our rigorous 12-point authentication, precision laser check, and artisan luxury packaging.",
      badge: "IN PROCESSING",
      color: "#f59e0b",
    },
    ORDER_SHIPPED: {
      subject: `🚚 Order #${order.orderNumber} Dispatched via Express Air — VELOCE`,
      headline: "Your Footwear is On the Way",
      message: `Your parcel has been dispatched with express air courier service. ${
        order.trackingNumber ? `Courier Tracking Reference: ${order.trackingNumber}` : ""
      }`,
      badge: "DISPATCHED",
      color: "#8b5cf6",
    },
    ORDER_DELIVERED: {
      subject: `✅ Order #${order.orderNumber} Successfully Delivered — VELOCE`,
      headline: "Package Delivered Successfully",
      message: "Your parcel has arrived at your destination address. Step into greatness and thank you for choosing VELOCE.",
      badge: "DELIVERED",
      color: "#10b981",
    },
    ORDER_CANCELLED: {
      subject: `⚠️ Order #${order.orderNumber} Cancellation Notice — VELOCE`,
      headline: "Order Cancelled",
      message: `Your order #${order.orderNumber} has been cancelled. If any payment was processed, a full refund has been initiated to your original payment method.`,
      badge: "CANCELLED",
      color: "#ef4444",
    },
  };

  const info = titles[type] || titles.ORDER_PLACED;
  let addressText = "Standard Destination";
  try {
    const parsed =
      typeof order.shippingAddress === "string"
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress;
    addressText = `${parsed.street}, ${parsed.city}, ${parsed.state} ${parsed.postalCode}, ${
      parsed.country || "US"
    }`;
  } catch (e) {
    addressText = String(order.shippingAddress || "Delivery Address");
  }

  const itemsHtml = (order.items || [])
    .map(
      (item: any) => `
      <tr style="border-bottom: 1px solid #27272a;">
        <td style="padding: 14px 0; color: #ffffff; font-weight: 600; font-size: 13px;">
          ${item.productName} <br/>
          <span style="font-size: 11px; color: #a1a1aa; font-weight: normal;">Size: EU ${
            item.size
          } • Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 14px 0; text-align: right; color: #ffffff; font-weight: 700; font-size: 13px; font-family: monospace;">
          ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>
    `
    )
    .join("");

  const noteSectionHtml = customNote
    ? `
      <div style="background-color: #1c1917; border: 1px solid #44403c; border-radius: 12px; padding: 14px; margin: 16px 0;">
        <div style="font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; color: #fbbf24;">Atelier Update Note</div>
        <p style="font-size: 13px; color: #f5f5f4; margin: 4px 0 0 0; line-height: 1.5;">${customNote}</p>
      </div>
    `
    : "";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 36px 16px; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 0 auto; background-color: #121215; border: 1px solid #27272a; border-radius: 24px; padding: 36px 28px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8); }
          .logo { font-family: system-ui, -apple-system, sans-serif; font-size: 28px; font-weight: 900; font-style: italic; letter-spacing: 2px; color: #ffffff; margin-bottom: 20px; }
          .logo span { color: #f43f5e; }
          .badge { display: inline-block; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: ${
            info.color
          }; background: rgba(255, 255, 255, 0.08); border: 1px solid ${
    info.color
  }40; padding: 6px 14px; border-radius: 9999px; margin-bottom: 14px; }
          h1 { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0; letter-spacing: -0.5px; }
          p { font-size: 13.5px; line-height: 1.6; color: #a1a1aa; margin: 0 0 16px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .summary-row { font-size: 13px; color: #a1a1aa; padding: 6px 0; }
          .summary-total { font-size: 16px; font-weight: 900; color: #ffffff; border-top: 1px solid #27272a; padding-top: 12px; }
          .button { display: inline-block; background-color: #ffffff; color: #09090b !important; text-decoration: none; font-weight: 800; font-size: 13px; padding: 14px 30px; border-radius: 9999px; margin-top: 20px; box-shadow: 0 10px 25px -5px rgba(255, 255, 255, 0.2); }
          .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #27272a; font-size: 11px; color: #71717a; text-align: center; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">VELOCE<span>.</span></div>
          <div class="badge">${info.badge}</div>
          <h1>${info.headline}</h1>
          <p>Dear ${order.customerName || "Patron"}, ${info.message}</p>

          ${noteSectionHtml}

          <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 16px; padding: 20px; margin: 20px 0;">
            <div style="font-size: 10px; color: #71717a; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px;">Order Reference</div>
            <div style="font-size: 18px; font-weight: 900; font-family: monospace; color: #ffffff; margin-top: 4px;">${
              order.orderNumber
            }</div>
            <div style="font-size: 12px; color: #a1a1aa; margin-top: 10px; line-height: 1.5;">📍 Destination: <strong>${addressText}</strong></div>
            ${
              order.trackingNumber
                ? `<div style="font-size: 12px; color: #34d399; font-weight: 800; margin-top: 8px; font-family: monospace; background: rgba(52, 211, 153, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(52, 211, 153, 0.2);">📦 Air Courier Tracking: ${order.trackingNumber}</div>`
                : ""
            }
          </div>

          <table>
            <thead>
              <tr style="border-bottom: 1px solid #27272a; text-align: left;">
                <th style="padding-bottom: 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #71717a;">Footwear Selection</th>
                <th style="padding-bottom: 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #71717a; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <table style="margin-top: 10px;">
            <tr>
              <td class="summary-row">Subtotal</td>
              <td class="summary-row" style="text-align: right; font-family: monospace;">${formatPrice(
                order.subtotal
              )}</td>
            </tr>
            ${
              order.discount > 0
                ? `<tr><td class="summary-row" style="color: #f83b3b;">Special Privilege Discount</td><td class="summary-row" style="text-align: right; color: #f83b3b; font-family: monospace;">-${formatPrice(
                    order.discount
                  )}</td></tr>`
                : ""
            }
            <tr>
              <td class="summary-row">Express Courier Shipping</td>
              <td class="summary-row" style="text-align: right; font-family: monospace;">${
                order.shippingFee === 0 ? "FREE" : formatPrice(order.shippingFee)
              }</td>
            </tr>
            <tr>
              <td class="summary-total">Total Amount</td>
              <td class="summary-total" style="text-align: right; font-family: monospace; color: #f43f5e;">${formatPrice(
                order.total
              )}</td>
            </tr>
          </table>

          <div style="text-align: center; margin-top: 28px;">
            <a href="${appUrl}/account/orders/${order.id}" class="button">Track Real-Time Order on Website →</a>
          </div>

          <div class="footer">
            Need concierge assistance? Simply reply to this email or reach concierge@veloce-shoes.com.<br/>
            &copy; 2026 VELOCE Footwear Inc. 888 Madison Avenue, New York, NY. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.log(
      `[Resend Email Simulated] ${type} to: ${order.customerEmail} for Order #${order.orderNumber}`
    );
    await recordEmailLog({
      recipientEmail: order.customerEmail,
      recipientName: order.customerName,
      subject: info.subject,
      message: `${info.headline}: ${info.message}${customNote ? ` (Note: ${customNote})` : ""}`,
      type: "ORDER",
      status: "SENT",
    });
    return { success: true, simulated: true };
  }

  try {
    const result = await resend.emails.send({
      from: emailFrom,
      to: order.customerEmail,
      subject: info.subject,
      html,
    });

    if (result.data?.id) {
      console.log(`✅ [Resend] ${type} email dispatched to ${order.customerEmail}. ID: ${result.data.id}`);
      await recordEmailLog({
        recipientEmail: order.customerEmail,
        recipientName: order.customerName,
        subject: info.subject,
        message: `${info.headline}: ${info.message}${customNote ? ` (Note: ${customNote})` : ""}`,
        type: "ORDER",
        status: "SENT",
        resendId: result.data.id,
      });
      return { success: true, id: result.data.id };
    } else {
      console.warn(`⚠️ [Resend] Notice for ${order.customerEmail}:`, result.error?.message);
      await recordEmailLog({
        recipientEmail: order.customerEmail,
        recipientName: order.customerName,
        subject: info.subject,
        message: `${info.headline}: ${info.message}`,
        type: "ORDER",
        status: "FAILED",
        error: result.error?.message,
      });
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    console.error(`❌ [Resend] ${type} email delivery error for ${order.customerEmail}:`, error);
    await recordEmailLog({
      recipientEmail: order.customerEmail,
      recipientName: order.customerName,
      subject: info.subject,
      type: "ORDER",
      status: "FAILED",
      error: error?.message || String(error),
    });
    return { success: false, error };
  }
}

export interface DealEmailPayload {
  recipientEmail: string;
  recipientName: string;
  deal: {
    id: string;
    title: string;
    subtitle?: string | null;
    badge?: string | null;
    bannerImage?: string | null;
    discountPercent?: number | null;
    fixedDiscount?: number | null;
    endDate?: string | Date | null;
    ctaText?: string | null;
    ctaLink?: string | null;
  };
}

export async function sendDealEmail({
  recipientEmail,
  recipientName,
  deal,
}: DealEmailPayload) {
  const resend = getResendClient();
  const emailFrom = getSender();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const discountText = deal.discountPercent
    ? `${deal.discountPercent}% OFF`
    : deal.fixedDiscount
    ? `Rs. ${deal.fixedDiscount} OFF`
    : "EXCLUSIVE SAVINGS";

  const subject = `🔥 New VELOCE Drop: ${deal.title} — ${discountText}`;
  const ctaUrl = deal.ctaLink?.startsWith("http")
    ? deal.ctaLink
    : `${appUrl}${deal.ctaLink || "/shop"}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #09090b;
            color: #f4f4f5;
            margin: 0;
            padding: 30px 16px;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            max-width: 580px;
            margin: 0 auto;
            background-color: #121215;
            border: 1px solid #27272a;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          }
          .header {
            padding: 36px 36px 20px 36px;
            text-align: center;
          }
          .logo {
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 26px;
            font-weight: 900;
            font-style: italic;
            letter-spacing: 2px;
            color: #ffffff;
            margin: 0;
          }
          .logo span {
            color: #f43f5e;
          }
          .tagline {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #a1a1aa;
            font-weight: 700;
            margin-top: 4px;
          }
          .banner-container {
            padding: 0 28px;
            margin: 16px 0;
          }
          .banner-image {
            width: 100%;
            max-height: 280px;
            object-fit: cover;
            border-radius: 18px;
            display: block;
            border: 1px solid #27272a;
          }
          .content {
            padding: 20px 36px 36px 36px;
            text-align: center;
          }
          .badge {
            display: inline-block;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #f43f5e;
            background: rgba(244, 63, 94, 0.12);
            border: 1px solid rgba(244, 63, 94, 0.25);
            padding: 6px 14px;
            border-radius: 9999px;
            margin-bottom: 14px;
          }
          .deal-headline {
            font-size: 18px;
            font-weight: 800;
            color: #ffffff;
            margin: 0 0 6px 0;
            letter-spacing: 0.5px;
          }
          .deal-title {
            font-size: 24px;
            font-weight: 900;
            color: #ffffff;
            margin: 0 0 12px 0;
            line-height: 1.25;
            letter-spacing: -0.5px;
          }
          .deal-desc {
            font-size: 14px;
            line-height: 1.6;
            color: #a1a1aa;
            margin: 0 0 20px 0;
          }
          .discount-box {
            background-color: #18181b;
            border: 1px solid #27272a;
            border-radius: 16px;
            padding: 16px;
            margin: 20px 0;
            text-align: center;
          }
          .discount-val {
            font-size: 28px;
            font-weight: 900;
            font-family: monospace;
            color: #f43f5e;
            letter-spacing: 1px;
          }
          .discount-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #71717a;
            font-weight: 700;
            margin-top: 4px;
          }
          .deal-expiry {
            font-size: 11px;
            color: #71717a;
            margin: 10px 0 24px 0;
            font-family: monospace;
          }
          .button {
            display: inline-block;
            background-color: #ffffff;
            color: #09090b !important;
            text-decoration: none;
            font-weight: 800;
            font-size: 13px;
            letter-spacing: 0.5px;
            padding: 16px 36px;
            border-radius: 9999px;
            box-shadow: 0 10px 25px -5px rgba(255, 255, 255, 0.2);
            transition: all 0.2s ease;
          }
          .divider {
            border-top: 1px solid #27272a;
            margin: 28px 0 20px 0;
          }
          .footer {
            padding: 24px 36px 36px 36px;
            font-size: 11px;
            line-height: 1.7;
            color: #71717a;
            text-align: center;
            border-top: 1px solid #27272a;
            background-color: #0e0e11;
          }
          .footer a {
            color: #a1a1aa;
            text-decoration: underline;
            margin: 0 6px;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <div class="logo">VELOCE<span>.</span></div>
            <div class="tagline">Luxury & Performance Footwear</div>
          </div>

          ${
            deal.bannerImage
              ? `<div class="banner-container">
                  <img src="${deal.bannerImage}" alt="${deal.title}" class="banner-image" />
                </div>`
              : ""
          }

          <div class="content">
            <div class="badge">${deal.badge || "LIMITED-TIME OFFER"}</div>
            <div class="deal-headline">🔥 NEW DEAL IS LIVE</div>
            <h1 class="deal-title">${deal.title}</h1>
            
            ${
              deal.subtitle
                ? `<p class="deal-desc">${deal.subtitle}</p>`
                : ""
            }

            <div class="discount-box">
              <div class="discount-val">${discountText}</div>
              <div class="discount-label">Exclusive Limited Allocation Privilege</div>
            </div>

            ${
              deal.endDate
                ? `<div class="deal-expiry">Countdown Expiry: ${formatDate(deal.endDate)}</div>`
                : ""
            }

            <div>
              <a href="${ctaUrl}" class="button">${deal.ctaText || "SHOP THE DEAL →"}</a>
            </div>
          </div>

          <div class="footer">
            <div style="font-weight: 700; color: #ffffff; margin-bottom: 6px;">
              VELOCE • Luxury & Performance Footwear
            </div>
            <div>
              You are receiving this email because you have an active account with VELOCE.
            </div>
            <div style="margin-top: 8px;">
              <a href="${appUrl}/account/settings">Manage notification preferences</a> • 
              <a href="${appUrl}/privacy">Privacy Policy</a> • 
              <a href="${appUrl}/contact">Support Concierge</a>
            </div>
            <div style="margin-top: 12px; font-size: 10px; color: #52525b;">
              &copy; 2026 VELOCE Footwear Inc. 888 Madison Avenue, New York, NY 10021.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.log(`[Resend Email Simulated] Deal alert to: ${recipientEmail} (${recipientName}) for Deal: ${deal.title}`);
    await recordEmailLog({
      recipientEmail,
      recipientName,
      subject,
      message: `Deal Alert: ${deal.title}`,
      type: "DEAL",
      status: "SENT",
    });
    return { success: true, simulated: true };
  }

  try {
    const result = await resend.emails.send({
      from: emailFrom,
      to: recipientEmail,
      subject,
      html,
    });

    if (result.data?.id) {
      console.log(`✅ [Resend] Deal email dispatched to ${recipientEmail}. ID: ${result.data.id}`);
      await recordEmailLog({
        recipientEmail,
        recipientName,
        subject,
        message: `Deal Alert: ${deal.title}`,
        type: "DEAL",
        status: "SENT",
        resendId: result.data.id,
      });
      return { success: true, id: result.data.id };
    } else {
      console.warn(`⚠️ [Resend] Notice for ${recipientEmail}:`, result.error?.message);
      await recordEmailLog({
        recipientEmail,
        recipientName,
        subject,
        type: "DEAL",
        status: "FAILED",
        error: result.error?.message,
      });
      return { success: false, error: result.error?.message || "Delivery warning" };
    }
  } catch (error: any) {
    console.error(`❌ [Resend] Deal email dispatch error for ${recipientEmail}:`, error);
    await recordEmailLog({
      recipientEmail,
      recipientName,
      subject,
      type: "DEAL",
      status: "FAILED",
      error: error?.message || String(error),
    });
    return { success: false, error: error?.message || "Delivery error" };
  }
}

export interface OtpEmailPayload {
  recipientEmail: string;
  recipientName?: string | null;
  code: string;
  purpose: "GOOGLE_LOGIN" | "PASSWORD_RESET";
}

export async function sendOtpEmail({
  recipientEmail,
  recipientName,
  code,
  purpose,
}: OtpEmailPayload) {
  const resend = getResendClient();
  const emailFrom = getSender();

  const headline =
    purpose === "PASSWORD_RESET"
      ? "Reset Your Password"
      : "Verify Your Account";

  const description =
    purpose === "PASSWORD_RESET"
      ? "We received a request to reset your VELOCE password. Enter the 6-digit verification code below to proceed:"
      : "Thank you for authenticating with Google. Please use the following 6-digit code to complete your verification:";

  const subject = "Your VELOCE verification code";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #09090b;
            color: #f4f4f5;
            margin: 0;
            padding: 36px 16px;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 540px;
            margin: 0 auto;
            background-color: #121215;
            border: 1px solid #27272a;
            border-radius: 24px;
            padding: 40px 32px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
          }
          .logo {
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 28px;
            font-weight: 900;
            font-style: italic;
            letter-spacing: 2px;
            color: #ffffff;
            margin: 0;
          }
          .logo span {
            color: #f43f5e;
          }
          .tagline {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #a1a1aa;
            font-weight: 700;
            margin-top: 4px;
          }
          .badge {
            display: inline-block;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #f43f5e;
            background: rgba(244, 63, 94, 0.12);
            border: 1px solid rgba(244, 63, 94, 0.25);
            padding: 5px 14px;
            border-radius: 9999px;
            margin: 28px 0 16px 0;
          }
          h1 {
            font-size: 22px;
            font-weight: 800;
            color: #ffffff;
            margin: 0 0 10px 0;
            letter-spacing: -0.5px;
          }
          p {
            font-size: 13px;
            line-height: 1.6;
            color: #a1a1aa;
            margin: 0 0 24px 0;
          }
          .otp-box {
            background-color: #18181b;
            border: 1px solid #3f3f46;
            border-radius: 18px;
            padding: 24px 16px;
            margin: 24px 0;
            text-align: center;
          }
          .otp-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #71717a;
            font-weight: 700;
            margin-bottom: 10px;
          }
          .otp-code {
            font-size: 38px;
            font-weight: 900;
            font-family: 'SF Mono', Consolas, 'Courier New', monospace;
            letter-spacing: 12px;
            color: #ffffff;
            margin: 0;
            text-indent: 12px;
          }
          .expiry-note {
            font-size: 12px;
            font-weight: 600;
            color: #f43f5e;
            margin-top: 10px;
          }
          .security-note {
            font-size: 11px;
            color: #71717a;
            line-height: 1.5;
            margin: 20px 0 0 0;
            padding: 14px;
            background: #09090b;
            border-radius: 12px;
            border: 1px solid #1f1f23;
          }
          .footer {
            margin-top: 36px;
            padding-top: 24px;
            border-top: 1px solid #27272a;
            font-size: 11px;
            color: #52525b;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">VELOCE<span>.</span></div>
          <div class="tagline">Luxury & Performance Footwear</div>

          <div class="badge">SECURITY VERIFICATION</div>
          <h1>${headline}</h1>
          <p>${description}</p>

          <div class="otp-box">
            <div class="otp-label">Your Verification Code</div>
            <div class="otp-code">${code}</div>
            <div class="expiry-note">This code expires in 10 minutes.</div>
          </div>

          <div class="security-note">
            If you did not request this code, you can safely ignore this email. No access was granted to your account.
          </div>

          <div class="footer">
            VELOCE Footwear Inc. • 888 Madison Avenue, New York, NY.<br/>
            Concierge Support: concierge@veloce-shoes.com
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.log(`\n========================================`);
    console.log(`🔑 [OTP SIMULATION] Code for ${recipientEmail}: ${code} (${purpose})`);
    console.log(`========================================\n`);
    await recordEmailLog({
      recipientEmail,
      recipientName,
      subject,
      message: `OTP Code (${purpose})`,
      type: "SECURITY",
      status: "SENT",
    });
    return { success: true, simulated: true, code };
  }

  try {
    const result = await resend.emails.send({
      from: emailFrom,
      to: recipientEmail,
      subject,
      html,
    });

    if (result.data?.id) {
      console.log(`✅ [Resend] OTP email dispatched to ${recipientEmail}. ID: ${result.data.id}`);
      await recordEmailLog({
        recipientEmail,
        recipientName,
        subject,
        message: `OTP verification code dispatched (${purpose})`,
        type: "SECURITY",
        status: "SENT",
        resendId: result.data.id,
      });
      return { success: true, id: result.data.id };
    } else {
      console.warn(`⚠️ [Resend] Notice for ${recipientEmail}:`, result.error?.message);
      console.log(`🔑 [OTP FALLBACK CODE] ${code} for ${recipientEmail}`);
      await recordEmailLog({
        recipientEmail,
        recipientName,
        subject,
        type: "SECURITY",
        status: "FAILED",
        error: result.error?.message,
      });
      return { success: true, fallbackCode: code, warning: result.error?.message };
    }
  } catch (error: any) {
    console.error(`❌ [Resend] OTP email error for ${recipientEmail}:`, error);
    console.log(`🔑 [OTP FALLBACK CODE] ${code} for ${recipientEmail}`);
    await recordEmailLog({
      recipientEmail,
      recipientName,
      subject,
      type: "SECURITY",
      status: "FAILED",
      error: error?.message || String(error),
    });
    return { success: true, fallbackCode: code, error: error?.message };
  }
}
