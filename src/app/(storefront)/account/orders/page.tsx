import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice, formatDate, ORDER_STATUSES } from "@/lib/utils";
import { Package, Truck, ChevronRight, ArrowLeft } from "lucide-react";

export const revalidate = 0;

export default async function OrdersHistoryPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?callbackUrl=/account/orders");
  }

  const orders = await db.order.findMany({
    where: {
      OR: [{ userId: session.id }, { customerEmail: session.email }],
    },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
            ORDER HISTORY
          </span>
          <h1 className="text-3xl font-display font-black text-zinc-900 dark:text-white tracking-tight mt-1">
            My Orders ({orders.length})
          </h1>
        </div>
        <Link
          href="/account/profile"
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Account Overview
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">No Orders Found</h2>
          <p className="text-xs text-zinc-500 mt-1">You haven't placed any footwear orders yet.</p>
          <Link
            href="/shop"
            className="mt-6 inline-block px-6 py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusConfig = ORDER_STATUSES.find((s) => s.value === order.orderStatus) || {
              label: order.orderStatus,
              color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
            };

            return (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800 text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400">Order Placed</p>
                      <p className="font-bold text-zinc-900 dark:text-white">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400">Reference</p>
                      <p className="font-mono font-bold text-zinc-900 dark:text-white">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400">Total</p>
                      <p className="font-mono font-bold text-zinc-900 dark:text-white">{formatPrice(order.total)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="px-4 py-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Order</span>
                    </Link>
                  </div>
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800"
                    >
                      <div className="relative w-14 h-14 rounded-xl bg-white dark:bg-zinc-800 p-1 shrink-0 flex items-center justify-center">
                        {item.productImage && (
                          <Image src={item.productImage} alt={item.productName} fill sizes="56px" className="object-contain" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{item.productName}</p>
                        <p className="text-[11px] text-zinc-500">Size: EU {item.size} • Qty: {item.quantity}</p>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white font-mono mt-0.5">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
