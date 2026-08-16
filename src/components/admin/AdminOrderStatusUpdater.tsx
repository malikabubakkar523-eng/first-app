"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { Truck, Check, RefreshCw } from "lucide-react";
import { ORDER_STATUSES } from "@/lib/utils";

interface AdminOrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
  currentTrackingNumber: string | null;
}

export function AdminOrderStatusUpdater({
  orderId,
  currentStatus,
  currentPaymentStatus,
  currentTrackingNumber,
}: AdminOrderStatusUpdaterProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [orderStatus, setOrderStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus,
          paymentStatus,
          trackingNumber: trackingNumber.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Order Status Updated!",
          description: `Changed to ${orderStatus}. Customer tracking synchronized.`,
          type: "success",
        });
        router.refresh();
      } else {
        toast({
          title: "Failed to update",
          description: data.error,
          type: "error",
        });
      }
    } catch (err) {
      toast({ title: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
        Update Fulfillment & Tracking
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
            Order Status
          </label>
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs font-semibold focus:outline-none"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label} ({s.value})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
            Payment Status
          </label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs font-semibold focus:outline-none"
          >
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
            Courier Tracking Number
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="e.g. TRK-9827189US"
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs font-mono focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        <Check className="w-4 h-4" />
        <span>{loading ? "Synchronizing..." : "Save Status Changes"}</span>
      </button>
    </form>
  );
}
