import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-xl bg-zinc-800 skeleton-shimmer" />
          <div className="h-4 w-72 rounded-full bg-zinc-800/60 skeleton-shimmer" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-zinc-800 skeleton-shimmer" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2"
          >
            <div className="h-3 w-20 rounded-full bg-zinc-800 skeleton-shimmer" />
            <div className="h-6 w-28 rounded-lg bg-zinc-800 skeleton-shimmer" />
          </div>
        ))}
      </div>

      {/* Main Table / Grid Skeleton */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="h-5 w-40 rounded-lg bg-zinc-800 skeleton-shimmer" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800/80 skeleton-shimmer"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
