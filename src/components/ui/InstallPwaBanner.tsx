"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Sparkles, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("VELOCE Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    }

    // Check if already installed / standalone
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      return;
    }

    // Check if user dismissed recently
    try {
      const dismissed = localStorage.getItem("veloce_pwa_dismissed");
      if (dismissed && Date.now() - Number(dismissed) < 1000 * 60 * 60 * 24 * 3) {
        return; // Don't show within 3 days of dismissal
      }
    } catch (e) {}

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt (Android / Chrome / Desktop)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowBanner(true), 2500); // polite delay
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // If iOS and not standalone, show polite banner after 4s
    if (isIosDevice && !isStandalone) {
      const timer = setTimeout(() => setShowBanner(true), 4000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    try {
      localStorage.setItem("veloce_pwa_dismissed", Date.now().toString());
    } catch (e) {}
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 rounded-2xl bg-zinc-950/95 text-white border border-zinc-800 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-start gap-3.5">
            <div className="relative w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 p-1">
              <Image
                src="/images/veloce-logo-icon.svg"
                alt="VELOCE App Icon"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold font-display text-white">VELOCE App</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-400 font-bold">
                  FASTEST
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                {isIOS
                  ? "Tap Share (⎙) then 'Add to Home Screen' for instant luxury app experience."
                  : "Install for 2x faster product browsing and instant order dispatch alerts."}
              </p>

              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="mt-2.5 px-3 py-1.5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install App
                </button>
              )}
            </div>

            <button
              onClick={handleDismiss}
              aria-label="Close banner"
              className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
