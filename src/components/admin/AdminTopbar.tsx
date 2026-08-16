"use client";

import React from "react";
import Link from "next/link";
import { Bell, Store, Shield, LogOut } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface AdminTopbarProps {
  user: any;
}

export function AdminTopbar({ user }: AdminTopbarProps) {
  return (
    <header className="h-16 bg-zinc-900 border-b border-zinc-800 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-zinc-300">Live Production Mode</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
        >
          <Store className="w-3.5 h-3.5 text-brand-500" />
          <span>Storefront Preview</span>
        </Link>

        <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

        <LogoutButton />
      </div>
    </header>
  );
}
