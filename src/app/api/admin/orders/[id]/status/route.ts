import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendOrderEmail, OrderEmailType } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const {
      orderStatus,
      paymentStatus,
      trackingNumber,
      customNote,
      sendEmail = true,
      sendNotification = true,
    } = body;

    const existingOrder = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (orderStatus) dataToUpdate.orderStatus = orderStatus;
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) dataToUpdate.trackingNumber = trackingNumber;
    if (customNote !== undefined) dataToUpdate.notes = customNote;

    let targetUserId = existingOrder.userId;

    // If order was placed as guest without userId, try matching by customerEmail
    if (!targetUserId && existingOrder.customerEmail) {
      const matchedUser = await db.user.findUnique({
        where: { email: existingOrder.customerEmail.toLowerCase().trim() },
      });
      if (matchedUser) {
        targetUserId = matchedUser.id;
        dataToUpdate.userId = matchedUser.id;
      }
    }

    const updated = await db.order.update({
      where: { id },
      data: dataToUpdate,
      include: { items: true },
    });

    // Determine status events & messages
    const messages: Record<
      string,
      { title: string; message: string; emailType: OrderEmailType }
    > = {
      PENDING: {
        title: `📋 Order #${updated.orderNumber} Received`,
        message: `Your order #${updated.orderNumber} has been received and queued for review.`,
        emailType: "ORDER_PLACED",
      },
      CONFIRMED: {
        title: `🎉 Order #${updated.orderNumber} Confirmed`,
        message: `Your order #${updated.orderNumber} has been confirmed by the atelier. Allocation is securely reserved.${
          customNote ? ` Note: ${customNote}` : ""
        }`,
        emailType: "ORDER_CONFIRMED",
      },
      PROCESSING: {
        title: `📦 Order #${updated.orderNumber} In Processing`,
        message: `Your order #${updated.orderNumber} is undergoing 12-point quality inspection and luxury packaging.${
          customNote ? ` Note: ${customNote}` : ""
        }`,
        emailType: "ORDER_PROCESSING",
      },
      SHIPPED: {
        title: `🚚 Order #${updated.orderNumber} Dispatched`,
        message: `Your order #${updated.orderNumber} has been dispatched! Courier Tracking: ${
          updated.trackingNumber || "Assigned in transit"
        }.${customNote ? ` Note: ${customNote}` : ""}`,
        emailType: "ORDER_SHIPPED",
      },
      DELIVERED: {
        title: `✅ Order #${updated.orderNumber} Delivered`,
        message: `Your order #${updated.orderNumber} has been delivered successfully. Enjoy your VELOCE footwear!`,
        emailType: "ORDER_DELIVERED",
      },
      CANCELLED: {
        title: `⚠️ Order #${updated.orderNumber} Cancelled`,
        message: `Your order #${updated.orderNumber} has been cancelled.${
          customNote ? ` Reason: ${customNote}` : " If payment was made, full refund will be credited."
        }`,
        emailType: "ORDER_CANCELLED",
      },
    };

    const statusChanged = orderStatus && orderStatus !== existingOrder.orderStatus;
    const trackingChanged =
      trackingNumber && trackingNumber !== existingOrder.trackingNumber;

    if (statusChanged || trackingChanged || customNote) {
      const activeStatus = orderStatus || existingOrder.orderStatus;
      const event = messages[activeStatus];

      if (event) {
        // 1. Create in-app website notification if customer account exists
        if (sendNotification && (targetUserId || updated.userId)) {
          try {
            await db.notification.create({
              data: {
                userId: targetUserId || updated.userId!,
                title: event.title,
                message: event.message,
                type: "ORDER",
                orderId: updated.id,
                isRead: false,
              },
            });
          } catch (notifErr) {
            console.warn("In-app notification dispatch error:", notifErr);
          }
        }

        // 2. Dispatch customer transactional email (Gmail / Resend)
        if (sendEmail) {
          sendOrderEmail({
            order: updated,
            type: event.emailType,
            customNote: customNote || undefined,
          }).catch((emailErr) => {
            console.error("Order status update email dispatch error:", emailErr);
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      order: updated,
      message: `Order #${updated.orderNumber} updated. Notifications and emails dispatched.`,
    });
  } catch (error) {
    console.error("Admin order update error", error);
    return NextResponse.json(
      { error: "Failed to update order status." },
      { status: 500 }
    );
  }
}
