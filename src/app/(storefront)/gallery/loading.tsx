import React from "react";

export default function GalleryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 animate-fadeIn">
      {/* Header Skeleton */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="h-4 w-36 rounded-full bg-zinc-800 skeleton-shimmer mx-auto" />
        <div className="h-10 w-72 rounded-2xl bg-zinc-800 skeleton-shimmer mx-auto" />
        <div className="h-4 w-96 rounded-full bg-zinc-800/60 skeleton-shimmer mx-auto" />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-28 rounded-full bg-zinc-800 skeleton-shimmer" />
        ))}
      </div>

      {/* Masonry / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="aspect-[4/5] rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden skeleton-shimmer"
          />
        ))}
      </div>
    </div>
  );
}
