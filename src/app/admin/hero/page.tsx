import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminHeroManager } from "@/components/admin/AdminHeroManager";
import { Layers, Sparkles, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin/hero");
  }

  const banners = await db.heroBanner.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  const serializedBanners = banners.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
  }));

  const activeCount = banners.filter((b) => b.isActive).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
            HOMEPAGE CONTENT ARCHITECTURE
          </span>
          <h1 className="text-2xl font-display font-black text-white tracking-tight mt-1">
            Hero & Banners Manager
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Control the visual imagery, typography, and call-to-action slides shown on the storefront homepage.
          </p>
        </div>
      </div>

      {/* Quick Statistics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/15 text-brand-500 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase text-zinc-400">Total Configured Slides</p>
            <p className="text-xl font-black font-display text-white">{banners.length}</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase text-zinc-400">Active on Live Homepage</p>
            <p className="text-xl font-black font-display text-white">{activeCount}</p>
          </div>
        </div>
      </div>

      {/* Hero Manager Client */}
      <AdminHeroManager initialBanners={serializedBanners} />
    </div>
  );
}
