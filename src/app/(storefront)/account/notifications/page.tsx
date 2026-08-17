import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft, Bell } from "lucide-react";
import { AccountNotificationsClient } from "@/components/storefront/AccountNotificationsClient";

export const revalidate = 0;

export default async function AccountNotificationsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?callbackUrl=/account/notifications");
  }

  const notifications = await db.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const serializedNotifications = notifications.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
            NOTIFICATION CENTER
          </span>
          <h1 className="text-3xl font-display font-black text-zinc-900 dark:text-white tracking-tight mt-1">
            Activity & Order Updates
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time status tracking, order confirmations, and exclusive drop announcements.
          </p>
        </div>
        <Link
          href="/account/profile"
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Account Overview
        </Link>
      </div>

      <AccountNotificationsClient initialNotifications={serializedNotifications} />
    </div>
  );
}
