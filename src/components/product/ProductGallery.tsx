"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: { id?: string; url: string; alt?: string | null }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const activeImage = images[selectedIndex]?.url || images[0]?.url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails Sidebar */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[500px] shrink-0 py-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 overflow-hidden transition-all shrink-0 p-2 flex items-center justify-center",
                selectedIndex === idx
                  ? "border-zinc-950 dark:border-white shadow-md scale-105"
                  : "border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Showcase Stage */}
      <div
        className="relative flex-1 aspect-[4/3.5] bg-zinc-50 dark:bg-zinc-900/60 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden flex items-center justify-center p-8 cursor-crosshair group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Subtle Background Glow */}
        <div className="absolute w-72 h-72 rounded-full bg-zinc-200/40 dark:bg-zinc-800/40 blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <Image
              src={activeImage}
              alt={productName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={cn(
                "object-contain transition-transform duration-200",
                isZoomed ? "scale-125" : "scale-100"
              )}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                    }
                  : undefined
              }
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom Hint Icon */}
        <div className="absolute bottom-4 right-4 p-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
