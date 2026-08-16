import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOrderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      subtotal,
      discount,
      shippingFee,
      tax,
      total,
      couponCode,
      items,
    } = body;

    if (!customerName || !customerEmail || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required order information." }, { status: 400 });
    }

    // Generate unique order number
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `VEL-${randomDigits}`;

    // Estimated delivery (4 days from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);

    // Verify product IDs for foreign key safety
    const itemCreates = [];
    for (const item of items) {
      const itemPrice = Number(item.price) || 0;
      const itemQty = Number(item.quantity) || 1;
      const itemTotal = item.total !== undefined ? Number(item.total) : itemPrice * itemQty;

      let validProductId: string | null = null;
      if (item.productId) {
        const prodExists = await db.product.findUnique({ where: { id: String(item.productId) } });
        if (prodExists) {
          validProductId = prodExists.id;
        }
      }

      itemCreates.push({
        productId: validProductId,
        productName: item.productName || "Footwear Item",
        productImage: item.productImage || null,
        size: String(item.size || "42"),
        color: item.color || null,
        price: itemPrice,
        quantity: itemQty,
        total: itemTotal,
      });
    }

    // Verify userId if supplied
    let validUserId: string | null = null;
    if (userId) {
      const userExists = await db.user.findUnique({ where: { id: String(userId) } });
      if (userExists) validUserId = userExists.id;
    }

    // Create database order
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: validUserId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        shippingAddress: typeof shippingAddress === "string" ? shippingAddress : JSON.stringify(shippingAddress),
        paymentMethod: paymentMethod || "CASH_ON_DELIVERY",
        paymentStatus: paymentStatus || "PENDING",
        orderStatus: "PENDING",
        subtotal: Number(subtotal) || 0,
        discount: Number(discount) || 0,
        shippingFee: Number(shippingFee) || 0,
        tax: Number(tax) || 0,
        total: Number(total) || 0,
        couponCode: couponCode || null,
        estimatedDelivery,
        items: {
          create: itemCreates,
        },
      },
      include: {
        items: true,
      },
    });

    // Create in-app order notification for customer if logged in
    if (validUserId) {
      try {
        await db.notification.create({
          data: {
            userId: validUserId,
            title: "Order Placed Successfully",
            message: `Your order #${orderNumber} for ${items.length} pair(s) has been placed and is being prepared.`,
            type: "ORDER",
            orderId: order.id,
            isRead: false,
          },
        });
      } catch (notifErr) {
        console.warn("In-app notification creation warning:", notifErr);
      }
    }

    // Trigger real transactional confirmation email via Resend
    sendOrderEmail({ order, type: "ORDER_PLACED" }).catch((emailErr) => {
      console.error("Order placed email dispatch error:", emailErr);
    });

    // Update inventory stock for each product size if valid product ID
    for (const item of items) {
      if (item.productId && item.size) {
        try {
          const productSize = await db.productSize.findFirst({
            where: { productId: item.productId, size: String(item.size) },
          });
          if (productSize) {
            await db.productSize.update({
              where: { id: productSize.id },
              data: {
                stock: Math.max(0, productSize.stock - (Number(item.quantity) || 1)),
              },
            });
          }
        } catch (stockErr) {
          console.warn("Stock update warning:", stockErr);
        }
      }
    }

    // If coupon used, increment its count
    if (couponCode) {
      try {
        await db.coupon.update({
          where: { code: couponCode },
          data: { usedCount: { increment: 1 } },
        });
      } catch (couponErr) {}
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Order creation error", error);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}
