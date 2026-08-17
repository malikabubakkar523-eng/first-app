"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
  ArrowLeft,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    items,
    removeItem,
    updateQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscount,
    getShippingFee,
    getTotal,
    clearCart,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const freeShippingThreshold = 5000;
  const shippingFee = getShippingFee(freeShippingThreshold, 250);
  const total = getTotal(freeShippingThreshold, 250);

  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const res = await fetch("/api/checkout/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Invalid Coupon",
          description: data.error || "Coupon could not be applied.",
          type: "error",
        });
      } else {
        applyCoupon(data.coupon);
        setCouponCode("");
        toast({
          title: "Coupon Applied!",
          description: `Saved ${formatPrice(data.coupon.discountAmount)} on your order.`,
          type: "success",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to validate coupon.",
        type: "error",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white font-display">
          Your shopping bag is empty
        </h1>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-2 leading-relaxed">
          Looks like you haven't added any pairs to your cart yet. Explore our handcrafted sneakers and carbon road racers.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold shadow-lg"
        >
          <span>Explore Footwear</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
            SHOPPING BAG
          </span>
          <h1 className="text-3xl font-display font-black text-zinc-900 dark:text-white tracking-tight mt-1">
            Review Bag ({items.reduce((s, i) => s + i.quantity, 0)} items)
          </h1>
        </div>
        <Link
          href="/shop"
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>

      {/* Free Shipping Notification */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200">
          <span>
            {amountNeeded === 0 ? (
              <span className="text-emerald-500 flex items-center gap-1">
                <Check className="w-4 h-4" /> Complimentary Global Express Shipping Unlocked!
              </span>
            ) : (
              <>Add <strong className="text-zinc-950 dark:text-white">{formatPrice(amountNeeded)}</strong> more to qualify for Free Shipping</>
            )}
          </span>
          <span className="font-mono text-zinc-400">{progressToFreeShipping}%</span>
        </div>
        <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressToFreeShipping}%` }}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Cart Item Rows */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const price = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row gap-5 items-start sm:items-center"
              >
                {/* Thumbnail */}
                <div className="relative w-24 h-24 rounded-2xl bg-zinc-50 dark:bg-zinc-800 p-2 shrink-0 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                  <Image src={item.image} alt={item.name} fill sizes="96px" className="object-contain" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                    {item.brandName || "Veloce Atelier"}
                  </span>
                  <Link
                    href={`/product/${item.slug}`}
                    className="block text-sm font-bold text-zinc-900 dark:text-white hover:text-brand-500 transition-colors"
                  >
                    {item.name}
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 pt-0.5">
                    <span>Size: <strong className="text-zinc-900 dark:text-white">EU {item.size}</strong></span>
                    {item.color && <span>• Color: {item.color}</span>}
                  </div>
                </div>

                {/* Quantity Controls & Price */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold font-mono text-zinc-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-black text-zinc-950 dark:text-white font-mono min-w-[70px] text-right">
                    {formatPrice(price * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
                    aria-label="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 bg-zinc-50 dark:bg-zinc-900/80 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-6">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Order Summary</h2>

          {/* Coupon Form */}
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold">
                <Tag className="w-4 h-4" />
                <span>Code <strong className="font-mono">{appliedCoupon.code}</strong> applied</span>
              </div>
              <button onClick={removeCoupon} className="text-xs text-zinc-400 hover:text-rose-500">
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="PROMO CODE"
                className="flex-1 px-4 py-2.5 text-xs uppercase font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={couponLoading || !couponCode.trim()}
                className="px-5 py-2.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 disabled:opacity-50"
              >
                {couponLoading ? "..." : "Apply"}
              </button>
            </form>
          )}

          {/* Breakdown */}
          <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-zinc-900 dark:text-white font-mono">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-brand-500 font-semibold">
                <span>Discount</span>
                <span className="font-mono">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span className="font-bold text-zinc-900 dark:text-white font-mono">
                {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span className="font-bold text-zinc-900 dark:text-white font-mono">
                {formatPrice(Math.max(0, subtotal - discount) * 0.08)}
              </span>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-baseline">
              <span className="text-sm font-bold text-zinc-950 dark:text-white">Estimated Total</span>
              <span className="text-xl font-black text-zinc-950 dark:text-white font-mono">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full py-4 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 text-xs font-bold shadow-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
