"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useCartStore } from "@/lib/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";
import { Heart, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const handleMoveToCart = (item: any) => {
    addItem({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      brandName: item.brandName,
      price: item.price,
      salePrice: item.salePrice,
      image: item.image,
      size: "42",
      quantity: 1,
      maxStock: 10,
    });
    removeItem(item.productId);
    toast({
      title: "Moved to Bag!",
      description: `${item.name} (EU 42)`,
      type: "success",
    });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 mx-auto mb-4">
          <Heart className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white font-display">
          Your wishlist is empty
        </h1>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-2 leading-relaxed">
          Save your favorite models to review them later or move them directly to your shopping bag.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold shadow-lg"
        >
          <span>Discover Shoes</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
            SAVED FOOTWEAR
          </span>
          <h1 className="text-3xl font-display font-black text-zinc-900 dark:text-white tracking-tight mt-1">
            My Wishlist ({items.length})
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={clearWishlist}
            className="text-xs text-zinc-400 hover:text-rose-500 transition-colors"
          >
            Clear All
          </button>
          <Link
            href="/shop"
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.productId}
            className="group relative flex flex-col bg-white dark:bg-zinc-900/60 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden p-4 justify-between transition-all hover:shadow-xl"
          >
            <div className="relative aspect-square rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 p-4 flex items-center justify-center overflow-hidden mb-3">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-contain group-hover:scale-105 transition-transform"
              />
              <button
                onClick={() => removeItem(item.productId)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-zinc-900/80 text-zinc-400 hover:text-rose-500 transition-colors"
                aria-label="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-zinc-400">
                {item.brandName || "Veloce Atelier"}
              </p>
              <Link
                href={`/product/${item.slug}`}
                className="block text-xs font-bold text-zinc-900 dark:text-white hover:text-brand-500 transition-colors truncate"
              >
                {item.name}
              </Link>
              <p className="text-xs font-bold text-zinc-900 dark:text-white font-mono">
                {formatPrice(item.salePrice || item.price)}
              </p>
            </div>

            <button
              onClick={() => handleMoveToCart(item)}
              className="mt-4 w-full py-2.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Move to Bag
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
