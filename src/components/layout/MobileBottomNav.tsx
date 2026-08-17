"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Heart, Images, Package, User } from "lucide-react";
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
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Shop",
      href: "/shop",
      icon: Compass,
      isActive: pathname === "/shop" || pathname.startsWith("/shop?"),
    },
    {
      label: "Wish",
      href: "/wishlist",
      icon: Heart,
      count: wishlistCount,
      isActive: pathname.startsWith("/wishlist"),
    },
    {
      label: "Gallery",
      href: "/gallery",
      icon: Images,
      isActive: pathname.startsWith("/gallery"),
    },
    {
      label: "Orders",
      href: "/account/orders",
      icon: Package,
      isActive: pathname.startsWith("/account/orders"),
    },
    {
      label: "Profile",
      href: "/account/profile",
      icon: User,
      isActive:
        (pathname.startsWith("/account") && !pathname.startsWith("/account/orders")) ||
        pathname === "/login" ||
        pathname === "/register",
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80 pt-1.5 px-1 pb-[max(env(safe-area-inset-bottom),6px)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none">
      <div className="grid grid-cols-6 items-center max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          return (
            <Link
              key={item.label}
              href={item.href}
              prefetch={true}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200",
                isActive
                  ? "text-zinc-950 dark:text-white font-bold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-[19px] h-[19px] transition-transform duration-200",
                    isActive ? "stroke-[2.5px] scale-105 text-brand-500" : "stroke-2"
                  )}
                />
                {mounted && item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1 -right-2 bg-brand-500 text-white text-[8.5px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">
                    {item.count > 9 ? "9+" : item.count}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[9.5px] tracking-tight truncate max-w-full mt-0.5 leading-none",
                  isActive ? "text-zinc-950 dark:text-white font-bold" : "text-zinc-500 dark:text-zinc-400"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-brand-500 absolute -bottom-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
