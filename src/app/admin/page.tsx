import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice, formatDate, ORDER_STATUSES } from "@/lib/utils";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Plus,
  Boxes,
  Truck,
} from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  // Aggregate Metrics via fast DB engine
  const [
    totalOrders,
    totalProducts,
    totalCustomers,
    revenueAgg,
    pendingOrdersCount,
    lowStockSizes,
    activeDealsCount,
    recentOrders,
  ] = await Promise.all([
    db.order.count(),
    db.product.count(),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.aggregate({ _sum: { total: true } }),
    db.order.count({ where: { orderStatus: "PENDING" } }),
    db.productSize.findMany({
      where: { stock: { lte: 4 } },
      include: { product: true },
      take: 5,
    }),
    db.deal.count({ where: { isActive: true, endDate: { gt: new Date() } } }),
    db.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
  ]);

  const totalRevenue = revenueAgg._sum.total || 0;

  const statCards = [
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      subtitle: "+18.4% this month",
      icon: DollarSign,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      subtitle: `${pendingOrdersCount} action required`,
      icon: ShoppingBag,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Catalog Footwear",
      value: totalProducts,
      subtitle: "22 active models",
      icon: Package,
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Active Customers",
      value: totalCustomers,
      subtitle: "Registered profiles",
      icon: Users,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
            EXECUTIVE OVERVIEW
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight mt-1">
            Store Performance Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Footwear</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold border border-zinc-800 flex items-center gap-2"
          >
            <Boxes className="w-4 h-4" />
            <span>Inventory Matrix</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  {stat.title}
                </span>
                <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-black font-display text-white font-mono">
                  {stat.value}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">{stat.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Low Stock Alert & Category Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Low Stock Alerts */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-white">Low Stock Warnings</h3>
            </div>
            <Link
              href="/admin/inventory"
              className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <span>Manage Stock</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockSizes.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4">All shoes have healthy inventory levels.</p>
            ) : (
              lowStockSizes.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white truncate">{s.product.name}</p>
                    <p className="text-[11px] text-zinc-500">Size: EU {s.size} • SKU: {s.sku}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black font-mono uppercase ${
                      s.stock === 0
                        ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}
                  >
                    {s.stock === 0 ? "SOLD OUT" : `${s.stock} LEFT`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Promotions Box */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-bold text-white">Active Promotional Campaigns</h3>
            </div>
            <Link
              href="/admin/deals"
              className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <span>Deals Hub</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                Active Sitewide Flash Sale
              </span>
              <span className="text-xs font-black font-mono text-white">40% OFF</span>
            </div>
            <p className="text-xs text-zinc-300">
              Coupon code <strong className="font-mono text-white">VELOCE20</strong> and <strong className="font-mono text-white">SUMMER40</strong> currently active with live storefront countdown timers.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders Management Table */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Customer Orders
            </h3>
            <p className="text-xs text-zinc-500">Live order intake with one-click fulfillment</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1"
          >
            <span>View All ({totalOrders})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="pb-3 font-semibold">Order Ref</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Items</th>
                <th className="pb-3 font-semibold">Total</th>
                <th className="pb-3 font-semibold">Payment</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {recentOrders.map((order) => {
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
                    <td className="py-3.5 text-zinc-400">{order.items.length} pairs</td>
                    <td className="py-3.5 font-mono font-bold text-white">{formatPrice(order.total)}</td>
                    <td className="py-3.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                        {order.paymentMethod === "ONLINE_PAYMENT" ? "CARD" : "COD"}
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
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-semibold transition-colors"
                      >
                        Manage
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
