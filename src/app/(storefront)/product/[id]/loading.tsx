import React from "react";

export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Gallery Skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] rounded-3xl bg-zinc-900 border border-zinc-800/80 skeleton-shimmer" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-2xl bg-zinc-900 border border-zinc-800 skeleton-shimmer" />
            ))}
          </div>
        </div>

        {/* Right: Info Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-28 rounded-full bg-zinc-800 skeleton-shimmer" />
            <div className="h-8 w-4/5 rounded-2xl bg-zinc-800 skeleton-shimmer" />
            <div className="h-6 w-32 rounded-xl bg-zinc-800 skeleton-shimmer mt-2" />
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <div className="h-4 w-24 rounded-full bg-zinc-800 skeleton-shimmer" />
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-11 rounded-xl bg-zinc-900 border border-zinc-800 skeleton-shimmer" />
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <div className="h-13 rounded-2xl bg-zinc-800 skeleton-shimmer" />
            <div className="h-13 rounded-2xl bg-zinc-900 border border-zinc-800 skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
