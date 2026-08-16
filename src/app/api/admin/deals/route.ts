import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendDealEmail } from "@/lib/email";
import { broadcastContentUpdate } from "@/lib/sync";

export const dynamic = "force-dynamic";

// Background notification worker function
async function dispatchDealNotifications(dealId: string) {
  try {
    const deal = await db.deal.findUnique({ where: { id: dealId } });
    if (!deal || !deal.isNotificationEnabled) return;

    const customers = await db.user.findMany({
      where: { role: "CUSTOMER", status: "ACTIVE" },
      select: { id: true, name: true, email: true, dealNotifs: true, promoEmails: true },
    });

    if (customers.length === 0) return;

    // Check existing logs to prevent duplicate sends
    const existingLogs = await db.dealNotificationLog.findMany({
      where: { dealId },
    });

    const loggedInApp = new Set(
      existingLogs.filter((l) => l.channel === "IN_APP" && l.userId).map((l) => l.userId)
    );
    const loggedEmail = new Set(
      existingLogs.filter((l) => l.channel === "EMAIL" && l.status === "SENT" && l.userId).map((l) => l.userId)
    );

    // 1. In-App Notifications
    const inAppCustomers = customers.filter(
      (c) => c.dealNotifs !== false && !loggedInApp.has(c.id)
    );

    if (inAppCustomers.length > 0) {
      await db.notification.createMany({
        data: inAppCustomers.map((c) => ({
          userId: c.id,
          title: `🔥 ${deal.badge || "LIMITED DEAL"}: ${deal.title}`,
          message:
            deal.subtitle ||
            `Special limited-time footwear allocation live now. Save ${
              deal.discountPercent ? `${deal.discountPercent}%` : "big"
            }.`,
          type: "DEAL",
          dealId: deal.id,
          isRead: false,
        })),
      });

      await db.dealNotificationLog.createMany({
        data: inAppCustomers.map((c) => ({
          dealId: deal.id,
          userId: c.id,
          channel: "IN_APP",
          status: "SENT",
        })),
      });
    }

    // 2. Email Notifications (Resend)
    const emailCustomers = customers.filter(
      (c) => c.promoEmails !== false && !loggedEmail.has(c.id)
    );

    for (const customer of emailCustomers) {
      try {
        const result = await sendDealEmail({
          recipientEmail: customer.email,
          recipientName: customer.name,
          deal: {
            id: deal.id,
            title: deal.title,
            subtitle: deal.subtitle,
            badge: deal.badge,
            bannerImage: deal.bannerImage,
            discountPercent: deal.discountPercent,
            fixedDiscount: deal.fixedDiscount,
            endDate: deal.endDate,
          },
        });

        const status = result.success ? "SENT" : "FAILED";
        const errorMsg = result.error ? String(result.error) : null;

        await db.dealNotificationLog.create({
          data: {
            dealId: deal.id,
            userId: customer.id,
            channel: "EMAIL",
            status,
            error: errorMsg,
          },
        });

        await db.emailLog.create({
          data: {
            recipientEmail: customer.email,
            recipientName: customer.name,
            subject: `🔥 New VELOCE Drop: ${deal.title}`,
            message: deal.subtitle || "Promotional Deal Campaign",
            type: "PROMOTION",
            status: status === "SENT" ? "SENT" : "FAILED",
            resendId: result.id || null,
            error: errorMsg,
            sender: "VELOCE Atelier",
          },
        });
      } catch (err: any) {
        await db.dealNotificationLog.create({
          data: {
            dealId: deal.id,
            userId: customer.id,
            channel: "EMAIL",
            status: "FAILED",
            error: err?.message || "Delivery error",
          },
        });
      }
    }
  } catch (err) {
    console.error("Background deal notification error:", err);
  }
}

export async function GET() {
  try {
    const deals = await db.deal.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, deals });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch deals." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const {
      title,
      subtitle,
      badge,
      discountPercent,
      fixedDiscount,
      startDate,
      endDate,
      isActive,
      isNotificationEnabled,
      bannerImage,
    } = await req.json();

    if (!title || !endDate) {
      return NextResponse.json({ error: "Title and end date are required." }, { status: 400 });
    }

    const deal = await db.deal.create({
      data: {
        title,
        subtitle: subtitle || "",
        badge: badge || "LIMITED OFFER",
        discountPercent: discountPercent !== undefined ? Number(discountPercent) : 20,
        fixedDiscount: fixedDiscount !== undefined ? Number(fixedDiscount) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        isNotificationEnabled: Boolean(isNotificationEnabled),
        bannerImage:
          bannerImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
      },
    });

    broadcastContentUpdate("DEAL");

    // Trigger asynchronous notification dispatch if enabled
    if (deal.isNotificationEnabled) {
      // Execute non-blocking in background
      dispatchDealNotifications(deal.id).catch((e) =>
        console.error("Async notification dispatch trigger failed:", e)
      );
    }

    return NextResponse.json({
      success: true,
      deal,
      message: deal.isNotificationEnabled
        ? "Deal published successfully. Notification delivery started."
        : "Deal published successfully.",
    });
  } catch (error) {
    console.error("Deal creation error", error);
    return NextResponse.json({ error: "Failed to create deal." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Deal ID required." }, { status: 400 });

    const body = await req.json();
    const {
      title,
      subtitle,
      badge,
      discountPercent,
      fixedDiscount,
      startDate,
      endDate,
      isActive,
      isNotificationEnabled,
      bannerImage,
    } = body;

    const updated = await db.deal.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(badge !== undefined && { badge }),
        ...(discountPercent !== undefined && { discountPercent: Number(discountPercent) }),
        ...(fixedDiscount !== undefined && { fixedDiscount: Number(fixedDiscount) }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(isNotificationEnabled !== undefined && { isNotificationEnabled: Boolean(isNotificationEnabled) }),
        ...(bannerImage !== undefined && { bannerImage }),
      },
    });

    broadcastContentUpdate("DEAL");

    return NextResponse.json({ success: true, deal: updated });
  } catch (error) {
    console.error("Deal update error", error);
    return NextResponse.json({ error: "Failed to update deal." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Deal ID required." }, { status: 400 });

    await db.deal.delete({ where: { id } });

    broadcastContentUpdate("DEAL");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete deal." }, { status: 500 });
  }
}
