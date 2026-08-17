"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Play, Volume2, VolumeX } from "lucide-react";

export function HomeVideoShowcase({
  videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-athlete-tying-running-shoes-close-up-42524-large.mp4",
  poster = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=85",
  title = "THE ART OF VELOCE: MOTION & MASTERY",
  subtitle = "Witness high-performance footwear engineered for relentless velocity. Every stride captured with Italian precision and carbon propulsion mechanics.",
  badge = "CINEMATIC FOOTWEAR ATELIER",
}: {
  videoUrl?: string;
  poster?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl">
        {/* Full-width responsive cinematic video container */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] min-h-[360px] sm:min-h-[440px] lg:min-h-[500px] overflow-hidden flex items-center">
          <video
            ref={videoRef}
            src={videoUrl}
            poster={poster}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          />

          {/* High-Contrast Gradient Vignette Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/70 md:via-zinc-950/40 to-transparent pointer-events-none z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-zinc-950/40 pointer-events-none z-[1]" />

          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-zinc-950/70 hover:bg-zinc-900 text-zinc-300 hover:text-white backdrop-blur-md border border-zinc-800 transition-all shadow-lg cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-brand-400" />}
          </button>

          {/* Video Foreground Content */}
          <div className="relative z-10 max-w-xl p-6 sm:p-12 lg:p-16 space-y-4 text-white text-left">
            {badge && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-[10.5px] sm:text-xs font-bold uppercase tracking-wider border border-brand-500/30 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>{badge}</span>
              </div>
            )}

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight leading-[1.1] text-white">
              {title}
            </h2>

            {subtitle && (
              <p className="text-xs sm:text-sm text-zinc-300 sm:text-zinc-300 leading-relaxed max-w-md">
                {subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/shop"
                className="px-6 py-3 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 text-xs sm:text-sm font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/gallery"
                className="px-5 py-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-700 backdrop-blur-md flex items-center gap-1.5 transition-colors"
              >
                <span>View In Lookbook</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
