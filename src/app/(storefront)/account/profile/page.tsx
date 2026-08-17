import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  Package,
  Heart,
  Settings,
  Shield,
  MapPin,
  ChevronRight,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Clock,
  Truck,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";

export const revalidate = 0;

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?callbackUrl=/account/profile");
  }

  const [user, wishlistCount, unreadNotifsCount] = await Promise.all([
    db.user.findUnique({
      where: { id: session.id },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: "desc" },
          take: 4,
          include: { items: true },
        },
      },
    }),
    db.wishlistItem.count({ where: { userId: session.id } }),
    db.notification.count({ where: { userId: session.id, isRead: false } }),
  ]);

  if (!user) {
    redirect("/login");
  }

  // Calculate Quick Stats
  const totalOrders = user.orders.length;
  const activeOrders = user.orders.filter(
    (o) => o.orderStatus !== "DELIVERED" && o.orderStatus !== "CANCELLED"
  ).length;
  const deliveredOrders = user.orders.filter(
    (o) => o.orderStatus === "DELIVERED"
  ).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Profile Header */}
      <div className="p-6 sm:p-10 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          {/* Circular Profile Avatar with fallback */}
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-zinc-800 border-2 border-brand-500 overflow-hidden flex items-center justify-center font-display font-black text-2xl text-white shadow-2xl shrink-0">
            {user.avatar ? (
              <Image src={user.avatar} alt={user.name} fill className="object-cover" />
            ) : (
              <span>{user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20">
                {user.role} PATRON
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Member since {new Date(user.createdAt).getFullYear()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1 tracking-tight">
              {user.name}
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              {user.email} {user.phone ? `• ${user.phone}` : ""}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/account/settings"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-zinc-700"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Edit Profile & Settings</span>
          </Link>

          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          )}

          <LogoutButton />
        </div>
      </div>

      {/* Quick Statistics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Orders</span>
            <Package className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-2xl font-black font-mono text-white">{totalOrders}</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active In-Transit</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black font-mono text-amber-400">{activeOrders}</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Delivered Pairs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-mono text-emerald-400">{deliveredOrders}</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Wishlist Items</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black font-mono text-rose-400">{wishlistCount}</p>
        </div>
      </div>

      {/* Grid: Recent Orders & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-500" />
              Recent Footwear Allocations
            </h2>
            <Link
              href="/account/orders"
              className="text-xs font-bold text-brand-500 hover:text-brand-400 flex items-center gap-1"
            >
              <span>View Full History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {user.orders.length === 0 ? (
            <div className="p-10 rounded-3xl bg-zinc-900/50 border border-zinc-800 text-center space-y-3">
              <Package className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-400">You have no order history yet.</p>
              <Link
                href="/shop"
                className="inline-block px-5 py-2.5 rounded-full bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition-colors"
              >
                Explore Footwear Collection
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {user.orders.map((o) => (
                <div
                  key={o.id}
                  className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-white">{o.orderNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 uppercase">
                        {o.orderStatus}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      {o.items.length} pair(s) • Total:{" "}
                      <span className="font-mono font-bold text-white">{formatPrice(o.total)}</span>
                    </p>
                    <p className="text-[10px] text-zinc-500">{formatDate(o.createdAt)}</p>
                  </div>

                  <Link
                    href={`/account/orders/${o.id}`}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
                  >
                    <span>View Order Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Navigation Cards & Address */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-500" />
            Quick Navigation
          </h2>

          <div className="space-y-2.5">
            <Link
              href="/account/notifications"
              className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center relative">
                  <Clock className="w-4 h-4" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                      Notification Center
                    </p>
                    {unreadNotifsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-brand-500 text-white text-[9px] font-bold">
                        {unreadNotifsCount} new
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500">Order alerts & status updates</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white" />
            </Link>

            <Link
              href="/wishlist"
              className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">
                    My Wishlist
                  </p>
                  <p className="text-[10px] text-zinc-500">{wishlistCount} saved styles</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white" />
            </Link>

            <Link
              href="/account/settings"
              className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                    Account & Security
                  </p>
                  <p className="text-[10px] text-zinc-500">Password, email & avatar</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white" />
            </Link>

            {/* Saved Address Preview */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-brand-500" />
                <span>Default Shipping Address</span>
              </div>
              {user.addresses[0] ? (
                <div className="text-xs text-zinc-400 space-y-0.5 pt-1">
                  <p className="font-bold text-white">{user.name}</p>
                  <p>{user.addresses[0].street}</p>
                  <p>
                    {user.addresses[0].city}, {user.addresses[0].state} {user.addresses[0].postalCode}
                  </p>
                  <p>{user.addresses[0].country}</p>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 pt-1">
                  No default shipping address on file. Add one during checkout.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
