"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Zap, Feather, Shield, Sparkles } from "lucide-react";

export function HeroShoe() {
  return (
    <div className="relative w-full aspect-square max-w-[540px] mx-auto flex items-center justify-center select-none">
      {/* Dynamic Ambient Background Glow (Neutral + Brand Accent) */}
      <div className="absolute w-80 h-80 rounded-full bg-brand-500/10 dark:bg-brand-500/20 blur-[90px] -top-10 -right-10 pointer-events-none animate-pulseGlow" />
      <div className="absolute w-72 h-72 rounded-full bg-sky-500/10 dark:bg-sky-500/10 blur-[80px] -bottom-8 -left-8 pointer-events-none" />

      {/* Subtle Orbital Dashed Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        className="absolute inset-2 rounded-full border border-dashed border-zinc-200/80 dark:border-zinc-800/80 pointer-events-none"
      />

      {/* Floating Spec Badge 1: Propulsion */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="absolute top-6 left-0 z-20 glass px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-200/60 dark:border-zinc-700/60"
      >
        <div className="w-8 h-8 rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">PROPULSION</p>
          <p className="text-xs font-bold text-zinc-900 dark:text-white">Full Carbon Plate</p>
        </div>
      </motion.div>

      {/* Floating Spec Badge 2: Featherweight */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="absolute bottom-12 right-0 z-20 glass px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-200/60 dark:border-zinc-700/60"
      >
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <Feather className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">FEATHERWEIGHT</p>
          <p className="text-xs font-bold text-zinc-900 dark:text-white">198 Grams (EU 42)</p>
        </div>
      </motion.div>

      {/* Floating Spec Badge 3: Craftsmanship */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="absolute -bottom-3 left-8 z-20 glass px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 border border-zinc-200/60 dark:border-zinc-700/60"
      >
        <Shield className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
        <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">Handcrafted in Tuscany</span>
      </motion.div>

      {/* Isolated High-Definition Hero Shoe Floating Naturally */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.92, rotate: -18 }}
        animate={{
          opacity: 1,
          y: [0, -16, 0],
          scale: 1,
          rotate: [-16, -13, -16],
        }}
        transition={{
          opacity: { duration: 0.8 },
          scale: { duration: 0.8 },
          y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
        }}
        className="relative w-[92%] h-[92%] z-10 filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_30px_45px_rgba(0,0,0,0.75)]"
      >
        {/* Transparent background shoe asset floating without any red rectangular bounding box */}
        <Image
          src="https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&q=85"
          alt="Veloce Apex Carbon Ghost"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 540px"
          className="object-contain transform hover:scale-105 transition-transform duration-500"
        />
      </motion.div>

      {/* Realistic Natural Floor Reflection / Ambient Cast Shadow */}
      <div className="absolute bottom-4 w-4/5 h-8 bg-zinc-950/20 dark:bg-black/80 rounded-full blur-2xl transform scale-y-40 pointer-events-none" />
    </div>
  );
}
