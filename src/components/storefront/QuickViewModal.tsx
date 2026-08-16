"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Star, ShoppingBag, Heart, ShieldCheck, Truck, ArrowRight } from "lucide-react";
import { formatPrice, calculateDiscountPercentage, cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useToast } from "@/components/ui/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number | null;
    rating?: number;
    reviewCount?: number;
    description?: string;
    details?: string | null;
    brand?: { name: string } | null;
    category?: { name: string; slug: string } | null;
    images: { url: string; alt?: string | null; isPrimary?: boolean }[];
    sizes?: { size: string; stock: number }[];
  };
}

export function QuickViewModal({
  isOpen,
  onClose,
  product,
}: QuickViewModalProps) {
  const { toast } = useToast();
  const { addItem, openCart } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();

  const [selectedImage, setSelectedImage] = useState(
    product.images[0]?.url ||
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.find((s) => s.stock > 0)?.size || "42"
  );
  const [adding, setAdding] = useState(false);

  const discount = product.salePrice
    ? calculateDiscountPercentage(product.price, product.salePrice)
    : 0;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    const sizeObj = product.sizes?.find((s) => s.size === selectedSize);
    if (sizeObj && sizeObj.stock <= 0) {
      toast({ title: "Selected size is out of stock", type: "error" });
      return;
    }

    setAdding(true);
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      brandName: product.brand?.name,
      price: product.price,
      salePrice: product.salePrice,
      image: selectedImage,
      size: selectedSize,
      quantity: 1,
      maxStock: sizeObj?.stock || 10,
    });

    toast({
      title: "Added to Bag",
      description: `${product.name} (EU ${selectedSize})`,
      type: "success",
    });

    setTimeout(() => {
      setAdding(false);
      onClose();
      openCart();
    }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden z-10 my-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
              {/* Left Column: Image Gallery */}
              <div className="space-y-4">
                <div className="relative aspect-square w-full rounded-2xl bg-zinc-950 border border-zinc-800/80 p-6 flex items-center justify-center overflow-hidden">
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-contain"
                  />
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      -{discount}% OFF
                    </span>
                  )}
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img.url)}
                        className={cn(
                          "relative w-16 h-16 rounded-xl bg-zinc-950 p-1 border transition-all shrink-0 overflow-hidden",
                          selectedImage === img.url
                            ? "border-brand-500 ring-1 ring-brand-500"
                            : "border-zinc-800 opacity-60 hover:opacity-100"
                        )}
                      >
                        <Image src={img.url} alt="" fill sizes="64px" className="object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Info & Actions */}
              <div className="flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500">
                    {product.brand?.name || "VELOCE ATELIER"}
                  </span>
                  <h2 className="text-xl font-bold text-white font-display mt-0.5">
                    {product.name}
                  </h2>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="text-xs font-bold text-white">
                        {product.rating ? product.rating.toFixed(1) : "5.0"}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      ({product.reviewCount || 12} reviews)
                    </span>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-2 mt-3">
                    {product.salePrice ? (
                      <>
                        <span className="text-2xl font-black font-mono text-white">
                          {formatPrice(product.salePrice)}
                        </span>
                        <span className="text-sm font-mono text-zinc-500 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-black font-mono text-white">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="text-xs text-zinc-400 mt-3 line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Size Selector */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-300">SELECT SIZE (EU)</span>
                      <span className="text-zinc-500 font-mono">Selected: {selectedSize}</span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                      {(product.sizes || [
                        { size: "39", stock: 10 },
                        { size: "40", stock: 8 },
                        { size: "41", stock: 12 },
                        { size: "42", stock: 15 },
                        { size: "43", stock: 6 },
                        { size: "44", stock: 4 },
                        { size: "45", stock: 2 },
                      ]).map((s) => (
                        <button
                          key={s.size}
                          disabled={s.stock <= 0}
                          onClick={() => setSelectedSize(s.size)}
                          className={cn(
                            "py-2 text-xs font-bold rounded-xl border transition-all text-center",
                            selectedSize === s.size
                              ? "bg-brand-500 text-white border-brand-500 shadow-md"
                              : s.stock <= 0
                              ? "opacity-30 border-dashed border-zinc-800 text-zinc-600 cursor-not-allowed"
                              : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700"
                          )}
                        >
                          {s.size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4 border-t border-zinc-800">
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddToCart}
                      disabled={adding}
                      className="flex-1 py-3 px-6 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{adding ? "Adding..." : "Add to Bag"}</span>
                    </button>

                    <button
                      onClick={() => {
                        toggleItem({
                          productId: product.id,
                          name: product.name,
                          slug: product.slug,
                          brandName: product.brand?.name,
                          price: product.price,
                          salePrice: product.salePrice,
                          image: selectedImage,
                          rating: product.rating,
                        });
                        toast({
                          title: inWishlist ? "Removed from Wishlist" : "Added to Wishlist",
                          type: "info",
                        });
                      }}
                      className={cn(
                        "p-3 rounded-2xl border transition-all",
                        inWishlist
                          ? "bg-brand-500 text-white border-brand-500"
                          : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
                      )}
                    >
                      <Heart className={cn("w-4 h-4", inWishlist && "fill-current")} />
                    </button>
                  </div>

                  <Link
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="block text-center text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    View Full Product Specifications & Reviews &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
