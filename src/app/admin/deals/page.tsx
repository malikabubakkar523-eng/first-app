import React from "react";
import { db } from "@/lib/db";
import { AdminDealsManager } from "@/components/admin/AdminDealsManager";

export const revalidate = 0;

export default async function AdminDealsPage() {
  let deals: any[] = [];
  try {
    deals = await db.deal.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.warn("⚠️ AdminDealsPage fallback:", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
          MARKETING & PROMOTIONS
        </span>
        <h1 className="text-2xl font-display font-black text-white tracking-tight mt-1">
          Flash Deals & Timed Campaigns
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Manage homepage countdown deals and promotional campaigns.
        </p>
      </div>

      <AdminDealsManager initialDeals={deals} />
    </div>
  );
}
