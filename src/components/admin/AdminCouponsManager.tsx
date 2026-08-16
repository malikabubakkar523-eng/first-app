"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { Tag, Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CouponItem {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | Date | null;
  isActive: boolean;
}

interface AdminCouponsManagerProps {
  initialCoupons: CouponItem[];
}

export function AdminCouponsManager({ initialCoupons }: AdminCouponsManagerProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons);
  const [isCreating, setIsCreating] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("20");
  const [minOrderAmount, setMinOrderAmount] = useState("100");
  const [usageLimit, setUsageLimit] = useState("500");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          description,
          discountType,
          discountValue: Number(discountValue),
          minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
          usageLimit: usageLimit ? Number(usageLimit) : null,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCoupons([data.coupon, ...coupons]);
        setCode("");
        setDescription("");
        setIsCreating(false);
        toast({
          title: "Coupon Code Created!",
          description: `Code ${data.coupon.code} is now valid at checkout.`,
          type: "success",
        });
        router.refresh();
      } else {
        toast({ title: "Failed to create coupon", type: "error" });
      }
    } catch (err) {
      toast({ title: "Error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this coupon code?")) return;

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons(coupons.filter((c) => c.id !== id));
        toast({ title: "Coupon Removed", type: "info" });
        router.refresh();
      }
    } catch (err) {
      toast({ title: "Error", type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl animate-scaleIn"
        >
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Configure New Coupon Code
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Coupon Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER40"
                className="w-full px-4 py-2.5 text-xs font-mono uppercase rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
              >
                <option value="PERCENTAGE">Percentage Off (%)</option>
                <option value="FIXED">Fixed Amount Off ($)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Discount Value {discountType === "PERCENTAGE" ? "(%)" : "($)"}
              </label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="20"
                className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Min Order Spend ($)
              </label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="100"
                className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Total Usage Limit
              </label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="500"
                className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Description / Notes
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="20% off on all orders over $100"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold disabled:opacity-50"
            >
              {loading ? "Creating..." : "Save Coupon"}
            </button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="pb-3 font-semibold">Code</th>
                <th className="pb-3 font-semibold">Discount</th>
                <th className="pb-3 font-semibold">Min Spend</th>
                <th className="pb-3 font-semibold">Used / Limit</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 font-mono font-bold text-white flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-brand-500" />
                    <span>{c.code}</span>
                  </td>
                  <td className="py-3.5 font-mono font-bold text-white">
                    {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `$${c.discountValue}`}
                  </td>
                  <td className="py-3.5 text-zinc-400 font-mono">
                    {c.minOrderAmount ? `$${c.minOrderAmount}` : "None"}
                  </td>
                  <td className="py-3.5 text-zinc-300 font-mono">
                    {c.usedCount} / {c.usageLimit || "∞"}
                  </td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
