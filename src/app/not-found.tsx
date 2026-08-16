import React from "react";
import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <div className="relative w-28 h-28 mx-auto rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-4xl shadow-2xl">
          👟
          <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-black font-mono">
            404
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
            PAGE NOT LOCATED
          </span>
          <h1 className="text-3xl font-display font-black text-white tracking-tight">
            Looks like this pair is missing.
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The page or model you were seeking might have been vaulted, renamed, or is temporarily out of rotation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/shop"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-100 flex items-center justify-center gap-2 shadow-lg"
          >
            <Compass className="w-4 h-4" />
            <span>Back to Shop</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-zinc-900 text-zinc-300 text-xs font-bold hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center gap-2"
          >
            <span>Return Home</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
