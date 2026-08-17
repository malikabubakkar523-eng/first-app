"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Images, Heart, Package, User } from "lucide-react";
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

  // Exact 6-item order: Home | Shop | Gallery | Wishlist | Orders | Profile
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
      label: "Gallery",
      href: "/gallery",
      icon: Images,
      isActive: pathname.startsWith("/gallery"),
    },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: Heart,
      count: wishlistCount,
      isActive: pathname.startsWith("/wishlist"),
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
    <nav
      aria-label="Mobile Navigation Bar"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80 pt-2 px-1 pb-[max(env(safe-area-inset-bottom),8px)] shadow-[0_-4px_24px_rgba(0,0,0,0.07)] select-none"
    >
      <div className="grid grid-cols-6 items-center w-full max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          return (
            <Link
              key={item.label}
              href={item.href}
              prefetch={true}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 px-0.5 rounded-xl min-h-[46px] transition-all duration-200 group touch-manipulation",
                isActive
                  ? "text-zinc-950 dark:text-white font-bold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={cn(
                    "w-[20px] h-[20px] transition-transform duration-200",
                    isActive
                      ? "stroke-[2.2] scale-105 text-zinc-950 dark:text-white"
                      : "stroke-[1.8] text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"
                  )}
                />
                {mounted && item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-brand-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none shadow-xs">
                    {item.count > 9 ? "9+" : item.count}
                  </span>
                )}
              </div>

              <span
                className={cn(
                  "text-[9.5px] tracking-tight truncate max-w-full mt-1 leading-none transition-colors",
                  isActive
                    ? "text-zinc-950 dark:text-white font-bold"
                    : "text-zinc-500 dark:text-zinc-400"
                )}
              >
                {item.label}
              </span>

              {/* Active Red Dot Indicator under active navigation item */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 absolute -bottom-1 shadow-xs" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
