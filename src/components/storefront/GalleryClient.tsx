"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Eye, X, ArrowRight, Tag, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryItemType {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description: string | null;
  shoeModel: string | null;
  link?: string | null;
  order: number;
}

import { useLiveSync } from "@/lib/useLiveSync";

export function GalleryClient({ initialItems }: { initialItems: GalleryItemType[] }) {
  const [items, setItems] = useState<GalleryItemType[]>(initialItems || []);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedItem, setSelectedItem] = useState<GalleryItemType | null>(null);

  // Live Sync Subscription: auto refresh gallery list on admin updates
  useLiveSync("GALLERY", async () => {
    try {
      const res = await fetch("/api/content/gallery", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.items) {
          setItems(data.items);
        }
      }
    } catch (e) {
      // ignore
    }
  });

  const categories = [
    { label: "All Curations", value: "ALL" },
    { label: "Women's Runway & Track", value: "WOMEN" },
    { label: "Men's Street & Atelier", value: "MEN" },
    { label: "Editorial & Backstage", value: "EDITORIAL" },
  ];

  const filteredItems = items.filter((item) => {
    if (activeCategory === "ALL") return true;
    return item.category.toUpperCase() === activeCategory;
  });

  return (
    <div className="space-y-10">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none ${
                isActive
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-lg scale-105"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Masonry / Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            onClick={() => setSelectedItem(item)}
            className="group relative rounded-3xl overflow-hidden bg-zinc-950 aspect-[3/4] cursor-pointer shadow-xl border border-zinc-200/60 dark:border-zinc-800/80 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl"
          >
            {/* Gallery Image */}
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-100"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

            {/* Category Tag Pill */}
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md text-brand-400 text-[10px] font-bold uppercase tracking-wider border border-zinc-800">
                {item.category}
              </span>
            </div>

            {/* Quick View Trigger Button */}
            <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 shadow-lg">
              <Eye className="w-4 h-4" />
            </div>

            {/* Bottom Content Card */}
            <div className="absolute inset-x-0 bottom-0 p-6 z-10 space-y-2">
              {item.shoeModel && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-mono border border-brand-500/30">
                  <Tag className="w-3 h-3" />
                  <span>{item.shoeModel}</span>
                </div>
              )}

              <h3 className="text-lg sm:text-xl font-bold font-display text-white group-hover:text-brand-300 transition-colors">
                {item.title}
              </h3>

              {item.description && (
                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}

              <div className="pt-1 flex items-center gap-1.5 text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
                <span>View High-Res Look</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* High-Resolution Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/90 backdrop-blur-xl animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col lg:flex-row"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-950/80 text-white flex items-center justify-center hover:bg-white hover:text-zinc-950 transition-colors border border-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Large Image View */}
              <div className="relative flex-1 min-h-[350px] lg:min-h-[550px] bg-zinc-950">
                <Image
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Detail Sidebar */}
              <div className="w-full lg:w-88 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 text-white">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-[10px] font-bold uppercase tracking-wider border border-brand-500/30">
                    {selectedItem.category} EDITORIAL
                  </span>

                  <h2 className="text-2xl font-bold font-display text-white">
                    {selectedItem.title}
                  </h2>

                  {selectedItem.description && (
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {selectedItem.description}
                    </p>
                  )}

                  {selectedItem.shoeModel && (
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                      <p className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
                        FEATURED FOOTWEAR MODEL
                      </p>
                      <p className="text-sm font-bold text-white">
                        {selectedItem.shoeModel}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Link
                    href={selectedItem.link || "/shop"}
                    onClick={() => setSelectedItem(null)}
                    className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-colors"
                  >
                    <span>{selectedItem.link ? "Explore This Silhouette" : "Shop Featured Silhouettes"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
