import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice, formatDate, ORDER_STATUSES } from "@/lib/utils";
import { ShoppingBag, ChevronRight, Eye } from "lucide-react";

export const revalidate = 0;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const { status } = searchParams;

  const where: any = {};
  if (status) {
    where.orderStatus = status;
  }

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
            ORDER FULFILLMENT
          </span>
          <h1 className="text-2xl font-display font-black text-white tracking-tight mt-1">
            Customer Orders ({orders.length})
          </h1>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Link
            href="/admin/orders"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              !status ? "bg-white text-zinc-950" : "bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            All Orders
          </Link>
          {ORDER_STATUSES.slice(0, 5).map((s) => (
            <Link
              key={s.value}
              href={`/admin/orders?status=${s.value}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                status === s.value
                  ? "bg-brand-500 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="pb-3 font-semibold">Order ID</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Items</th>
                <th className="pb-3 font-semibold">Total</th>
                <th className="pb-3 font-semibold">Payment</th>
                <th className="pb-3 font-semibold">Order Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {orders.map((order) => {
                const statusConfig = ORDER_STATUSES.find((s) => s.value === order.orderStatus) || {
                  label: order.orderStatus,
                  color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
                };

                return (
                  <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-white">{order.orderNumber}</td>
                    <td className="py-3.5">
                      <p className="font-semibold text-white">{order.customerName}</p>
                      <p className="text-[10px] text-zinc-500">{order.customerEmail}</p>
                    </td>
                    <td className="py-3.5 text-zinc-400">{formatDate(order.createdAt)}</td>
                    <td className="py-3.5 text-zinc-400">{order.items.length} pairs</td>
                    <td className="py-3.5 font-mono font-bold text-white">{formatPrice(order.total)}</td>
                    <td className="py-3.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
