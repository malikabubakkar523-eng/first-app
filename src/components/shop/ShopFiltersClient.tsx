"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Check, RotateCcw } from "lucide-react";
import { SHOE_SIZES } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ShopFiltersClientProps {
  categories: any[];
  brands: any[];
  productsCount: number;
  currentParams: Record<string, string | undefined>;
  children: React.ReactNode;
}

export function ShopFiltersClient({
  categories,
  brands,
  productsCount,
  currentParams,
  children,
}: ShopFiltersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const activeCategory = currentParams.category || "";
  const activeBrand = currentParams.brand || "";
  const activeSize = currentParams.size || "";
  const activeSort = currentParams.sort || "featured";
  const activeMinPrice = currentParams.minPrice || "";
  const activeMaxPrice = currentParams.maxPrice || "";

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const handleReset = () => {
    router.push("/shop");
    setMobileFilterOpen(false);
  };

  const filterSidebar = (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
          Category
        </h4>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam("category", null)}
            className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
              !activeCategory
                ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => updateParam("category", activeCategory === c.slug ? null : c.slug)}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                activeCategory === c.slug
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
          Brand
        </h4>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam("brand", null)}
            className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
              !activeBrand
                ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <span>All Brands</span>
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => updateParam("brand", activeBrand === b.slug ? null : b.slug)}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                activeBrand === b.slug
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Shoe Sizes Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
          Size (EU)
        </h4>
        <div className="grid grid-cols-4 gap-1.5">
          {SHOE_SIZES.map((sz) => (
            <button
              key={sz}
              onClick={() => updateParam("size", activeSize === sz ? null : sz)}
              className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all text-center ${
                activeSize === sz
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-sm"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400"
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
          Price Range
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={activeMinPrice}
            onChange={(e) => updateParam("minPrice", e.target.value || null)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono focus:outline-none"
          />
          <span className="text-zinc-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={activeMaxPrice}
            onChange={(e) => updateParam("maxPrice", e.target.value || null)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono focus:outline-none"
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={handleReset}
        className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-xs font-semibold hover:text-zinc-900 dark:hover:text-white flex items-center justify-center gap-2 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reset Filters
      </button>
    </div>
  );

  return (
    <div>
      {/* Top Toolbar (Sort + Mobile Filter Toggle) */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-xs font-bold flex items-center gap-2 text-zinc-800 dark:text-zinc-200"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {(activeCategory || activeBrand || activeSize || activeMinPrice || activeMaxPrice) && (
            <span className="w-2 h-2 rounded-full bg-brand-500" />
          )}
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-zinc-400 font-medium hidden sm:inline">Sort by:</label>
          <select
            value={activeSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="featured">Featured & Popular</option>
            <option value="newest">Newest Drops</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Left Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80">
          {filterSidebar}
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-9">{children}</div>
      </div>

      {/* Mobile Animated Filter Bottom Sheet / Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-950 rounded-t-3xl p-6 shadow-2xl border-t border-zinc-200 dark:border-zinc-800 z-10 space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-500" />
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">Filter Footwear</h3>
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {filterSidebar}

              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold shadow-lg"
              >
                Apply Filters ({productsCount} Results)
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
