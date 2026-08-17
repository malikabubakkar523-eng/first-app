import React from "react";
import { db } from "@/lib/db";
import { Settings, Shield, Truck, Bell, Store } from "lucide-react";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  let settings: any = null;
  try {
    settings = await db.storeSettings.findFirst();
  } catch (error) {
    console.warn("⚠️ AdminSettingsPage fallback:", error);
  }

  const defaultSettings = {
    storeName: "VELOCE",
    supportEmail: "support@veloce-shoes.com",
    supportPhone: "+92 (51) 835-6231",
    currencyCode: "PKR",
    currencySymbol: "Rs.",
    defaultShippingFee: 250,
    freeShippingThreshold: 5000,
    announcement: "Complimentary nationwide express shipping on all orders over Rs. 5,000.",
  };

  const finalSettings = settings || defaultSettings;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
          GLOBAL CONFIGURATION
        </span>
        <h1 className="text-2xl font-display font-black text-white tracking-tight mt-1">
          Store Settings & Policies
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Manage currency, shipping threshold rules, contact info, and announcement banners.
        </p>
      </div>

      <div className="space-y-6">
        {/* Store Info */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-white text-sm font-bold uppercase tracking-wider">
            <Store className="w-4 h-4 text-brand-500" />
            <span>Store Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Brand Name
              </label>
              <input
                type="text"
                defaultValue={settings?.storeName || "VELOCE"}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Currency Symbol
              </label>
              <input
                type="text"
                defaultValue={settings?.currencySymbol || "Rs."}
                className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Concierge Support Email
              </label>
              <input
                type="email"
                defaultValue={settings?.supportEmail || "support@veloce-shoes.com"}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Support Phone
              </label>
              <input
                type="text"
                defaultValue={settings?.supportPhone || "+92 (51) 835-6231"}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Thresholds */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-white text-sm font-bold uppercase tracking-wider">
            <Truck className="w-4 h-4 text-emerald-500" />
            <span>Shipping & Fulfillment Rules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Free Express Shipping Spend Threshold (PKR / Rs.)
              </label>
              <input
                type="number"
                defaultValue={settings?.freeShippingThreshold || 5000}
                className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Standard Shipping Flat Rate (PKR / Rs.)
              </label>
              <input
                type="number"
                defaultValue={settings?.defaultShippingFee || 250}
                className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-white text-sm font-bold uppercase tracking-wider">
            <Bell className="w-4 h-4 text-amber-500" />
            <span>Storefront Top Announcement Bar</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Live Banner Text
            </label>
            <input
              type="text"
              defaultValue={
                settings?.announcement ||
                "Complimentary nationwide express shipping on orders over Rs. 5,000. Use code VELOCE20 for 20% off."
              }
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          className="w-full py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold border border-zinc-800 shadow-md transition-colors"
        >
          Save Configuration Preferences
        </button>
      </div>
    </div>
  );
}
