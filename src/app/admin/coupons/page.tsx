import React from "react";
import { db } from "@/lib/db";
import { AdminCouponsManager } from "@/components/admin/AdminCouponsManager";

export const revalidate = 0;

export default async function AdminCouponsPage() {
  let coupons: any[] = [];
  try {
    coupons = await db.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.warn("⚠️ AdminCouponsPage fallback:", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
          DISCOUNT SYSTEM
        </span>
        <h1 className="text-2xl font-display font-black text-white tracking-tight mt-1">
          Promo Codes & Coupons
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Create percentage or fixed-amount discount coupons validated server-side during checkout.
        </p>
      </div>

      <AdminCouponsManager initialCoupons={coupons} />
    </div>
  );
}
