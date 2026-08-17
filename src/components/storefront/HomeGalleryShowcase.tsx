"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, ArrowRight, Sparkles, Tag, Eye, ChevronRight, User, Baby } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryLookbookItem, CURATED_GALLERY_ITEMS } from "@/lib/galleryData";

export function HomeGalleryShowcase({ items }: { items?: any[] }) {
  const [activeTab, setActiveTab] = useState<"ALL" | "MEN" | "WOMEN" | "KIDS">("ALL");

  const sourceItems: GalleryLookbookItem[] =
    items && items.length > 0 ? (items as any) : CURATED_GALLERY_ITEMS;

  const filtered = sourceItems
    .filter((item) => {
      if (activeTab === "ALL") return true;
      return item.category === activeTab;
    })
    .slice(0, 4);

  const tabs: { label: string; value: "ALL" | "MEN" | "WOMEN" | "KIDS"; icon: any }[] = [
    { label: "All Curations", value: "ALL", icon: Sparkles },
    { label: "Men's Atelier", value: "MEN", icon: User },
    { label: "Women's Runway", value: "WOMEN", icon: Sparkles },
    { label: "Kids & Youth", value: "KIDS", icon: Baby },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-500 uppercase tracking-widest mb-1.5">
            <Camera className="w-3.5 h-3.5" />
            <span>SS26 LOOKBOOK & RUNWAY SPOTLIGHT</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-black text-zinc-900 dark:text-white tracking-tight">
            Style & Performance Gallery
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            See how icons and athletes style our footwear across Men&apos;s, Women&apos;s, and Kids silhouettes in Paris, Tokyo, and New York.
          </p>
        </div>

        {/* Tab Switchers on Desktop & Mobile */}
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-full border border-zinc-200/80 dark:border-zinc-800 self-start md:self-auto overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-md scale-[1.02]"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of 4 Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05, duration: 0.25 }}
              className="group relative rounded-3xl overflow-hidden bg-zinc-950 aspect-[4/5] shadow-lg hover:shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 transition-all duration-500 hover:-translate-y-1.5"
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-108 transition-transform duration-700 brightness-95 group-hover:brightness-100"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-black/20 opacity-85 group-hover:opacity-90 transition-opacity" />

              {/* Category Pill */}
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md text-brand-400 text-[10px] font-bold uppercase tracking-wider border border-zinc-800 shadow-sm">
                  {item.category === "KIDS"
                    ? "KIDS & YOUTH"
                    : item.category === "WOMEN"
                    ? "WOMEN"
                    : "MEN"}
                </span>
              </div>

              {/* Bottom Info */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 space-y-1.5">
                {item.shoeModel && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300 text-[9.5px] font-mono border border-brand-500/30">
                    <Tag className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[170px]">{item.shoeModel}</span>
                  </div>
                )}

                <h3 className="text-sm sm:text-base font-bold font-display text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                  {item.title}
                </h3>

                <Link
                  href="/gallery"
                  className="pt-1 text-[11px] font-bold text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  <span>Explore in Gallery</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Explore All Banner */}
      <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
              Looking for more style inspiration?
            </h4>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              Browse our complete SS26 Editorial Runway Lookbook with high-res zoom & direct shoe styling.
            </p>
          </div>
        </div>

        <Link
          href="/gallery"
          className="px-6 py-2.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold hover:scale-105 transition-all flex items-center gap-2 shrink-0 shadow-sm"
        >
          <span>Open Full Gallery</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
