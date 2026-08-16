import React from "react";
import { db } from "@/lib/db";
import { AdminInventoryClient } from "@/components/admin/AdminInventoryClient";

export const revalidate = 0;

export default async function AdminInventoryPage() {
  const sizes = await db.productSize.findMany({
    orderBy: [{ product: { name: "asc" } }, { size: "asc" }],
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          images: { select: { url: true }, take: 1 },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
          WAREHOUSE STOCK MATRIX
        </span>
        <h1 className="text-2xl font-display font-black text-white tracking-tight mt-1">
          Inventory Control
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Real-time size inventory with low stock indicators (&le; 4) and instant stock adjustments.
        </p>
      </div>

      <AdminInventoryClient initialSizes={sizes} />
    </div>
  );
}
