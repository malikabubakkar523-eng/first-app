"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export function LogoutButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast({
        title: "Logged Out",
        description: "You have been securely logged out.",
        type: "info",
      });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 text-xs font-semibold hover:border-rose-500/30 transition-colors flex items-center gap-2"
    >
      <LogOut className="w-4 h-4" />
      <span>{loading ? "Signing out..." : "Sign Out"}</span>
    </button>
  );
}
