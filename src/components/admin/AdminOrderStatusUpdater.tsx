"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Check,
  Truck,
  XCircle,
  PackageCheck,
  Clock,
  Send,
  Mail,
  Bell,
  Sparkles,
} from "lucide-react";
import { ORDER_STATUSES } from "@/lib/utils";

interface AdminOrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
  currentTrackingNumber: string | null;
  currentNotes?: string | null;
}

export function AdminOrderStatusUpdater({
  orderId,
  currentStatus,
  currentPaymentStatus,
  currentTrackingNumber,
  currentNotes,
}: AdminOrderStatusUpdaterProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [orderStatus, setOrderStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber || "");
  const [customNote, setCustomNote] = useState(currentNotes || "");
  const [sendEmail, setSendEmail] = useState(true);
  const [sendNotification, setSendNotification] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (overrideStatus?: string) => {
    setLoading(true);
    const targetStatus = overrideStatus || orderStatus;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: targetStatus,
          paymentStatus,
          trackingNumber: trackingNumber.trim() || null,
          customNote: customNote.trim() || null,
          sendEmail,
          sendNotification,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrderStatus(targetStatus);
        toast({
          title: "Order Status Updated!",
          description: `Changed to ${targetStatus}.${
            sendEmail ? " Gmail/Email sent." : ""
          }${sendNotification ? " In-app notification sent." : ""}`,
          type: "success",
        });
        router.refresh();
      } else {
        toast({
          title: "Failed to update",
          description: data.error || "An error occurred",
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
    <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500">
          FULFILLMENT CONTROL
        </span>
        <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
          Update Order Status & Dispatch
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Changing status will automatically send a real-time message to the customer's Gmail and their website notification bell.
        </p>
      </div>

      {/* Quick 1-Click Status Triggers */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Quick Action Buttons
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setOrderStatus("CONFIRMED");
              handleUpdate("CONFIRMED");
            }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
              orderStatus === "CONFIRMED"
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 ring-2 ring-emerald-500/20"
                : "bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-emerald-500/50 hover:text-emerald-400"
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirm Order</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setOrderStatus("PROCESSING");
              handleUpdate("PROCESSING");
            }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
              orderStatus === "PROCESSING"
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40 ring-2 ring-amber-500/20"
                : "bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-amber-500/50 hover:text-amber-400"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Processing</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setOrderStatus("SHIPPED");
              handleUpdate("SHIPPED");
            }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
              orderStatus === "SHIPPED"
                ? "bg-purple-500/20 text-purple-400 border-purple-500/40 ring-2 ring-purple-500/20"
                : "bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-purple-500/50 hover:text-purple-400"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Ship Order</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setOrderStatus("DELIVERED");
              handleUpdate("DELIVERED");
            }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
              orderStatus === "DELIVERED"
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 ring-2 ring-emerald-500/20"
                : "bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-emerald-500/50 hover:text-emerald-400"
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Delivered</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setOrderStatus("CANCELLED");
              handleUpdate("CANCELLED");
            }}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
              orderStatus === "CANCELLED"
                ? "bg-rose-500/20 text-rose-400 border-rose-500/40 ring-2 ring-rose-500/20"
                : "bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-rose-500/50 hover:text-rose-400"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel Order</span>
          </button>
        </div>
      </div>

      {/* Manual Controls & Details */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate();
        }}
        className="space-y-4 pt-2 border-t border-zinc-800"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Order Status Select
            </label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs font-semibold focus:outline-none focus:border-brand-500"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs font-semibold focus:outline-none focus:border-brand-500"
            >
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
            Courier Tracking Number (Air Express)
          </label>
          <div className="relative">
            <Truck className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. TRK-9827189US or LEOPARDS-8921"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
            Customer Update Note / Cancellation Reason
          </label>
          <textarea
            rows={2}
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Optional message to be included in customer's Gmail and website notification..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Notification checkboxes */}
        <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-brand-500 focus:ring-0 cursor-pointer"
            />
            <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Send Gmail / Email Dispatch Alert</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={sendNotification}
              onChange={(e) => setSendNotification(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-brand-500 focus:ring-0 cursor-pointer"
            />
            <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Send Website In-App Bell Notification</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white text-xs font-bold shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? "Synchronizing & Sending..." : "Save Changes & Notify Customer"}</span>
        </button>
      </form>
    </div>
  );
}
