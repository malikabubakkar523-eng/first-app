"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Package, Flame, Sparkles, CheckCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  orderId?: string | null;
  dealId?: string | null;
  productId?: string | null;
  createdAt: string;
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      // ignore
    }
  };

  const handleMarkOneRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (e) {
      // ignore
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return <Package className="w-3.5 h-3.5 text-blue-500" />;
      case "DEAL":
        return <Flame className="w-3.5 h-3.5 text-amber-500" />;
      case "PROMOTION":
        return <Sparkles className="w-3.5 h-3.5 text-brand-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle notifications dropdown"
        aria-expanded={isOpen}
        className="relative p-1.5 sm:p-2 rounded-full text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer select-none"
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute 0 top-0.5 right-0.5 w-4 h-4 rounded-full bg-brand-500 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-88 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-50 animate-scaleIn select-none">
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => {
                const targetHref = n.orderId
                  ? `/account/orders/${n.orderId}`
                  : n.type === "DEAL" || n.dealId
                  ? "/shop"
                  : undefined;

                const content = (
                  <div
                    key={n.id}
                    onClick={(e) => {
                      if (!n.isRead) handleMarkOneRead(n.id, e);
                      if (targetHref) setIsOpen(false);
                    }}
                    className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 ${
                      !n.isRead ? "bg-brand-500/5 dark:bg-brand-500/10" : ""
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {formatDate(n.createdAt)}
                        </span>
                        {targetHref && (
                          <span className="text-[10px] text-brand-500 font-semibold hover:underline">
                            {n.type === "DEAL" ? "Shop Deal →" : "View Details →"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );

                if (targetHref) {
                  return (
                    <Link key={n.id} href={targetHref} className="block">
                      {content}
                    </Link>
                  );
                }

                return content;
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
