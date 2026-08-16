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
    const { orderStatus, paymentStatus, trackingNumber } = await req.json();

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

    const updated = await db.order.update({
      where: { id },
      data: dataToUpdate,
      include: { items: true },
    });

    // Check if status changed to trigger notifications & emails
    if (orderStatus && orderStatus !== existingOrder.orderStatus) {
      const messages: Record<string, { title: string; message: string; emailType: OrderEmailType }> = {
        CONFIRMED: {
          title: "Order Confirmed",
          message: `Your order #${updated.orderNumber} has been confirmed by our atelier team.`,
          emailType: "ORDER_CONFIRMED",
        },
        PROCESSING: {
          title: "Order Processing",
          message: `Your order #${updated.orderNumber} is now undergoing quality verification and packing.`,
          emailType: "ORDER_PROCESSING",
        },
        SHIPPED: {
          title: "Order Shipped",
          message: `Your order #${updated.orderNumber} has been dispatched. Tracking: ${updated.trackingNumber || "Assigned on transit"}`,
          emailType: "ORDER_SHIPPED",
        },
        DELIVERED: {
          title: "Order Delivered",
          message: `Your order #${updated.orderNumber} has been delivered. Enjoy your VELOCE footwear.`,
          emailType: "ORDER_DELIVERED",
        },
        CANCELLED: {
          title: "Order Cancelled",
          message: `Your order #${updated.orderNumber} has been cancelled.`,
          emailType: "ORDER_CANCELLED",
        },
      };

      const event = messages[orderStatus];
      if (event) {
        // 1. Create in-app customer notification if user is linked
        if (updated.userId) {
          try {
            await db.notification.create({
              data: {
                userId: updated.userId,
                title: event.title,
                message: event.message,
                type: "ORDER",
                orderId: updated.id,
                isRead: false,
              },
            });
          } catch (notifErr) {
            console.warn("Status change notification error:", notifErr);
          }
        }

        // 2. Trigger customer transactional email via Resend
        sendOrderEmail({ order: updated, type: event.emailType }).catch((emailErr) => {
          console.error("Order status update email dispatch error:", emailErr);
        });
      }
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Admin order update error", error);
    return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
  }
}
