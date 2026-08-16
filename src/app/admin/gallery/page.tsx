import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminGalleryManagerClient } from "@/components/admin/AdminGalleryManagerClient";
import { Camera, Image as ImageIcon, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin/gallery");
  }

  const items = await db.galleryItem.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  const serializedItems = items.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));

  const womenCount = items.filter((i) => i.category === "WOMEN").length;
  const menCount = items.filter((i) => i.category === "MEN").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
            EDITORIAL & CAMPAIGNS
          </span>
          <h1 className="text-2xl font-display font-black text-white tracking-tight mt-1">
            Lookbook & Runway Gallery
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage high-definition editorial and campaign photos of models styling VELOCE footwear.
          </p>
        </div>
      </div>

      {/* Quick Statistics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/15 text-brand-500 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase text-zinc-400">Total Lookbook Photos</p>
            <p className="text-xl font-black font-display text-white">{items.length}</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase text-zinc-400">Women's Campaign Photos</p>
            <p className="text-xl font-black font-display text-white">{womenCount}</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase text-zinc-400">Men's Street & Runway Photos</p>
            <p className="text-xl font-black font-display text-white">{menCount}</p>
          </div>
        </div>
      </div>

      {/* Manager Client */}
      <AdminGalleryManagerClient initialItems={serializedItems} />
    </div>
  );
}
