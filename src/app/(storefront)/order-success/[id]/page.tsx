import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { CheckCircle2, Package, Truck, ArrowRight, ShieldCheck } from "lucide-react";

export const revalidate = 0;

export default async function OrderSuccessPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const order = await db.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  let address: any = {};
  try {
    address = JSON.parse(order.shippingAddress);
  } catch (e) {
    address = { street: order.shippingAddress };
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20 space-y-8">
      {/* Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto animate-scaleIn">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-500">
          ORDER AUTHORIZED & CONFIRMED
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-zinc-900 dark:text-white tracking-tight">
          Thank you, {order.customerName}!
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
          We've sent a detailed confirmation receipt to <strong className="text-zinc-900 dark:text-white">{order.customerEmail}</strong>.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400">Order Reference</p>
            <p className="text-base font-black text-zinc-900 dark:text-white font-mono">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400">Estimated Delivery</p>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {order.estimatedDelivery ? formatDate(order.estimatedDelivery) : "3 - 5 Business Days"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400">Payment Status</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Ordered Footwear ({order.items.length})</p>
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
              <div className="relative w-14 h-14 rounded-xl bg-zinc-50 dark:bg-zinc-800 p-1 shrink-0 flex items-center justify-center">
                {item.productImage ? (
                  <Image src={item.productImage} alt={item.productName} fill sizes="56px" className="object-contain" />
                ) : (
                  <Package className="w-6 h-6 text-zinc-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{item.productName}</p>
                <p className="text-[11px] text-zinc-500">Size: EU {item.size} • Qty: {item.quantity}</p>
              </div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white font-mono">{formatPrice(item.total)}</p>
            </div>
          ))}
        </div>

        {/* Breakdown */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono text-zinc-900 dark:text-white font-semibold">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-brand-500 font-semibold">
              <span>Promo Discount</span>
              <span className="font-mono">-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Express Courier</span>
            <span className="font-mono text-zinc-900 dark:text-white font-semibold">
              {order.shippingFee === 0 ? "FREE" : formatPrice(order.shippingFee)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span className="font-mono text-zinc-900 dark:text-white font-semibold">{formatPrice(order.tax)}</span>
          </div>
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-baseline">
            <span className="text-sm font-bold text-zinc-950 dark:text-white">Total Paid</span>
            <span className="text-lg font-black text-zinc-950 dark:text-white font-mono">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Destination address */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
          <p className="font-bold text-zinc-900 dark:text-white mb-1">Shipping Destination:</p>
          <p>{address.street}, {address.city}, {address.state} {address.postalCode}, {address.country || "US"}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <Link
          href={`/account/orders/${order.id}`}
          className="flex-1 py-4 rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold text-center shadow-lg hover:opacity-90 flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4" />
          <span>Track Order Status</span>
        </Link>
        <Link
          href="/shop"
          className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-bold text-center hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center gap-2"
        >
          <span>Continue Browsing</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
