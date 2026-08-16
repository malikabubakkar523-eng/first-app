"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";

interface SafeQueryBoundaryProps<T> {
  fetchFn: () => Promise<T>;
  timeoutMs?: number;
  loadingFallback?: ReactNode;
  errorMessage?: string;
  children: (data: T, refresh: () => void) => ReactNode;
}

export function SafeQueryBoundary<T>({
  fetchFn,
  timeoutMs = 10000,
  loadingFallback,
  errorMessage = "Unable to load this content.",
  children,
}: SafeQueryBoundaryProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    setIsTimedOut(false);

    let isDone = false;

    // Timeout timer
    const timer = setTimeout(() => {
      if (!isDone) {
        setIsTimedOut(true);
        setLoading(false);
        setError("This is taking longer than expected.");
      }
    }, timeoutMs);

    try {
      const result = await fetchFn();
      isDone = true;
      clearTimeout(timer);
      setData(result);
      setLoading(false);
    } catch (err: any) {
      isDone = true;
      clearTimeout(timer);
      setLoading(false);
      setError(err?.message || errorMessage);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    if (loadingFallback) return <>{loadingFallback}</>;

    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        <p className="text-xs font-semibold">Loading content...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-10 px-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 text-center space-y-4 max-w-md mx-auto my-4 animate-fadeIn">
        <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-white">
            {isTimedOut ? "Request Timed Out" : "Loading Notice"}
          </p>
          <p className="text-xs text-zinc-400">
            {error || errorMessage}
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  return <>{children(data, loadData)}</>;
}
