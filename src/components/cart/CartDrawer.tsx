"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles, Tag, Check } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";

export function CartDrawer() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscount,
    getShippingFee,
    getTotal,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const freeShippingThreshold = 150;
  const shippingFee = getShippingFee(freeShippingThreshold, 15);
  const total = getTotal(freeShippingThreshold, 15);

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

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-white dark:bg-zinc-950 shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-brand-500" />
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">Shopping Bag</h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {items.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                </div>
                <button
                  onClick={closeCart}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Meter */}
              <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {amountNeeded === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Free Express Shipping Unlocked!
                      </span>
                    ) : (
                      <>
                        Add <strong className="text-zinc-950 dark:text-white">{formatPrice(amountNeeded)}</strong> more for Free Shipping
                      </>
                    )}
                  </span>
                  <span className="font-mono text-zinc-400 font-medium">{progressToFreeShipping}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToFreeShipping}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-brand-500 rounded-full"
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 mb-4">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">Your bag is empty</h3>
                    <p className="text-xs text-zinc-500 max-w-xs mt-1">
                      Discover our high-performance carbon racers and luxury Italian footwear.
                    </p>
                    <Link
                      href="/shop"
                      onClick={closeCart}
                      className="mt-6 px-6 py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      Explore Collection
                    </Link>
                  </div>
                ) : (
                  items.map((item) => {
                    const price = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 p-3 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/80"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-20 h-20 rounded-xl bg-white dark:bg-zinc-800/60 p-2 shrink-0 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-contain"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                href={`/product/${item.slug}`}
                                onClick={closeCart}
                                className="text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:text-brand-500 transition-colors line-clamp-1"
                              >
                                {item.name}
                              </Link>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-zinc-400 hover:text-rose-500 transition-colors p-0.5"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
                              <span>Size: <strong className="text-zinc-800 dark:text-zinc-200">EU {item.size}</strong></span>
                              {item.color && <span>• {item.color}</span>}
                            </div>
                          </div>

                          {/* Quantity & Price */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-semibold font-mono text-zinc-900 dark:text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.maxStock}
                                className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-xs font-bold text-zinc-950 dark:text-white font-mono">
                              {formatPrice(price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer / Checkout Summary */}
              {items.length > 0 && (
                <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
                  {/* Promo Code Input */}
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs">
                      <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Code <strong className="font-mono">{appliedCoupon.code}</strong> applied</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs font-medium text-zinc-400 hover:text-rose-500"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Promo code (e.g. VELOCE20)"
                        className="flex-1 px-3 py-2 text-xs uppercase font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                      />
                      <button
                        type="submit"
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-800 text-xs font-bold hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </form>
                  )}

                  {/* Summary Details */}
                  <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-brand-600 dark:text-brand-400 font-semibold">
                        <span>Discount</span>
                        <span className="font-mono">-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Express Shipping</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                        {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-zinc-950 dark:text-white">Estimated Total</span>
                      <span className="text-base font-black text-zinc-950 dark:text-white font-mono">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 text-xs font-bold shadow-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
