"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader } from "@/components/ui/Loader";

const DELAY_THRESHOLD_MS = 180; // Only show loader if navigation takes >180ms
const SAFETY_TIMEOUT_MS = 8000; // Never freeze screen longer than 8s

export function SmartPageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isVisible, setIsVisible] = useState(false);
  const showTimerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentUrlRef = useRef<string>("");

  // Dismiss loader immediately when route changes
  useEffect(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    setIsVisible(false);
    currentUrlRef.current = `${pathname}?${searchParams.toString()}`;
  }, [pathname, searchParams]);

  // Intercept internal link clicks with smart delay threshold
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external, anchor links, mailto, tel, target="_blank", or download links
      if (
        href.startsWith("http") && !href.startsWith(window.location.origin) ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.getAttribute("target") === "_blank" ||
        target.hasAttribute("download")
      ) {
        return;
      }

      // Check if target is different from current URL
      const targetUrl = new URL(href, window.location.origin);
      const currentUrl = new URL(window.location.href);

      if (
        targetUrl.pathname === currentUrl.pathname &&
        targetUrl.search === currentUrl.search
      ) {
        return; // Same page
      }

      // Clear existing timers
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);

      // Start 180ms delay threshold timer
      showTimerRef.current = setTimeout(() => {
        setIsVisible(true);

        // Set failsafe timeout to prevent infinite stuck loaders
        safetyTimerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, SAFETY_TIMEOUT_MS);
      }, DELAY_THRESHOLD_MS);
    };

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950/75 dark:bg-zinc-950/85 backdrop-blur-md text-white select-none transition-opacity duration-200 animate-fadeIn pointer-events-auto"
    >
      <div className="p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 shadow-2xl flex flex-col items-center gap-4 max-w-xs text-center animate-scaleIn">
        <Loader />
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-300">
            VELOCE
          </p>
          <p className="text-[11px] text-zinc-400 font-medium">
            Loading page...
          </p>
        </div>
      </div>
    </div>
  );
}
