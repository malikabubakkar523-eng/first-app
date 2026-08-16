import React from "react";

export default function ShopLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      {/* Header Skeleton */}
      <div className="space-y-3 max-w-xl">
        <div className="h-4 w-28 rounded-full bg-zinc-800/80 skeleton-shimmer" />
        <div className="h-10 w-64 rounded-2xl bg-zinc-800/80 skeleton-shimmer" />
        <div className="h-4 w-96 rounded-full bg-zinc-800/60 skeleton-shimmer" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-zinc-800/80 skeleton-shimmer" />
          ))}
        </div>
        <div className="h-9 w-36 rounded-xl bg-zinc-800/80 skeleton-shimmer" />
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="rounded-3xl bg-zinc-900/60 border border-zinc-800/60 p-4 space-y-3 overflow-hidden"
          >
            <div className="aspect-square rounded-2xl bg-zinc-800/70 skeleton-shimmer" />
            <div className="h-3 w-20 rounded-full bg-zinc-800 skeleton-shimmer" />
            <div className="h-4 w-3/4 rounded-full bg-zinc-800 skeleton-shimmer" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-4 w-16 rounded-full bg-zinc-800 skeleton-shimmer" />
              <div className="h-7 w-7 rounded-full bg-zinc-800 skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
