"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent can toggle
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
        }
      } catch (err) {
        console.error("Search fetch error", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/shop?search=${encodeURIComponent(query)}`);
  };

  const trendingTags = ["Carbon Ghost", "Ultraboost", "Jordan 1 Retro", "Chelsea Boot", "Triple S", "Samba"];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <form onSubmit={handleSubmit} className="relative flex items-center px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <Search className="w-5 h-5 text-zinc-400 shrink-0 mr-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by shoe name, category, brand, or SKU..."
                autoFocus
                className="w-full bg-transparent text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-2 py-1 text-xs font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:text-zinc-600"
              >
                ESC
              </button>
            </form>

            {/* Modal Body */}
            <div className="max-h-[60vh] overflow-y-auto p-5">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-zinc-400">Searching catalog...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider px-2">
                    <span>Products ({results.length})</span>
                    <span>Press Enter for all</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.map((product) => {
                      const img = product.images?.[0]?.url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80";
                      return (
                        <Link
                          key={product.id}
                          href={`/product/${product.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors group border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                        >
                          <div className="relative w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0 overflow-hidden flex items-center justify-center p-1">
                            <Image
                              src={img}
                              alt={product.name}
                              fill
                              sizes="60px"
                              className="object-contain group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-zinc-400 uppercase font-medium">{product.brand?.name || "Veloce"}</p>
                            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-brand-500 transition-colors">
                              {product.name}
                            </p>
                            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-200 mt-0.5">
                              {formatPrice(product.salePrice || product.price)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full mt-4 py-2.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <span>View all matching results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : query.trim() ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    No shoes matching <strong className="text-zinc-900 dark:text-white">"{query}"</strong>
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">Try searching by category, size, or brand instead.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
                    <span>Popular Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setQuery(tag);
                        }}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
