import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice, formatDate, formatDateTime, ORDER_STATUSES } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  ArrowLeft,
  Check,
  ShieldCheck,
} from "lucide-react";

export const revalidate = 0;

export default async function OrderTrackingPage({
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

  const timelineSteps = [
    { key: "PENDING", label: "Order Placed", desc: "Received and authenticated" },
    { key: "CONFIRMED", label: "Confirmed", desc: "Inventory allocated & boxed" },
    { key: "PROCESSING", label: "Processing", desc: "Hand-inspected by horologists" },
    { key: "SHIPPED", label: "Shipped", desc: "Dispatched with tracking courier" },
    { key: "DELIVERED", label: "Delivered", desc: "Signed and handed over" },
  ];

  const statusOrder = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentIndex = statusOrder.indexOf(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
            REAL-TIME DISPATCH TRACKING
          </span>
          <h1 className="text-3xl font-display font-black text-zinc-900 dark:text-white tracking-tight mt-1">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Created on {formatDateTime(order.createdAt)} • Status: <strong className="text-zinc-900 dark:text-white font-bold">{order.orderStatus}</strong>
          </p>
        </div>
        <Link
          href="/account/orders"
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> All Orders
        </Link>
      </div>

      {/* Progress Timeline Graphic */}
      <div className="p-6 sm:p-10 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-8">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
          Delivery Progress
        </h2>

        {/* Stepper bar */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {timelineSteps.map((step, idx) => {
            const isCompleted = currentIndex >= idx && order.orderStatus !== "CANCELLED";
            const isCurrent = currentIndex === idx && order.orderStatus !== "CANCELLED";

            return (
              <div key={step.key} className="flex md:flex-col items-start gap-4 md:gap-3 relative">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                    isCompleted
                      ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-md ring-4 ring-zinc-200 dark:ring-zinc-800"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
                </div>

                <div className="space-y-0.5">
                  <p
                    className={`text-xs font-bold ${
                      isCompleted ? "text-zinc-950 dark:text-white" : "text-zinc-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-zinc-500 leading-tight">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {order.trackingNumber && (
          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs flex items-center justify-between text-brand-600 dark:text-brand-400 font-semibold">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>Courier Tracking Number: <strong className="font-mono">{order.trackingNumber}</strong></span>
            </div>
            <span className="text-[11px] font-mono uppercase">Global Air Express</span>
          </div>
        )}
      </div>

      {/* Breakdown Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Items */}
        <div className="md:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            Items in Parcel ({order.items.length})
          </h3>
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800"
            >
              <div className="relative w-16 h-16 rounded-xl bg-zinc-50 dark:bg-zinc-800 p-1 shrink-0 flex items-center justify-center">
                {item.productImage ? (
                  <Image src={item.productImage} alt={item.productName} fill sizes="64px" className="object-contain" />
                ) : (
                  <Package className="w-6 h-6 text-zinc-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{item.productName}</p>
                <p className="text-[11px] text-zinc-500">Size: EU {item.size} • Qty: {item.quantity}</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-white font-mono mt-1">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Shipping & Summary */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Delivery Destination
            </h3>
            <div className="text-zinc-600 dark:text-zinc-400 space-y-1">
              <p className="font-bold text-zinc-900 dark:text-white">{order.customerName}</p>
              <p>{address.street}</p>
              <p>{address.city}, {address.state} {address.postalCode}</p>
              <p>{address.country || "United States"}</p>
              <p className="pt-2 text-zinc-500">Contact: {order.customerEmail}</p>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex justify-between text-zinc-500">
                <span>Payment Method</span>
                <span className="font-semibold text-zinc-900 dark:text-white">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Payment Status</span>
                <span className="font-bold text-emerald-500">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between text-zinc-900 dark:text-white font-bold pt-2 border-t border-zinc-200 dark:border-zinc-800 text-sm">
                <span>Total Amount</span>
                <span className="font-mono">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
