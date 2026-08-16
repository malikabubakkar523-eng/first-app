"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Heart, Package, User } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const wishlistCount = useWishlistStore((state) => state.items.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide on admin routes to allow clean admin experience
  if (pathname.startsWith("/admin")) return null;

  const items = [
    { label: "Home", href: "/", icon: Home },
    { label: "Shop", href: "/shop", icon: Compass },
    { label: "Wishlist", href: "/wishlist", icon: Heart, count: wishlistCount },
    { label: "Orders", href: "/account/orders", icon: Package },
    { label: "Profile", href: "/account/profile", icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80 pt-2 px-2 pb-[max(env(safe-area-inset-bottom),8px)] shadow-lg select-none">
      <div className="grid grid-cols-5 gap-0.5 items-center max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              prefetch={true}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200",
                isActive
                  ? "text-zinc-950 dark:text-white font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                {mounted && item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1 -right-2 bg-brand-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-brand-500 absolute bottom-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
