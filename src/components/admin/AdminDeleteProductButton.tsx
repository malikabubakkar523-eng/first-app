"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

interface AdminDeleteProductButtonProps {
  productId: string;
  productName: string;
}

export function AdminDeleteProductButton({
  productId,
  productName,
}: AdminDeleteProductButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove "${productName}" from the catalog?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({
          title: "Product Removed",
          description: productName,
          type: "info",
        });
        router.refresh();
      } else {
        toast({ title: "Failed to delete product", type: "error" });
      }
    } catch (err) {
      toast({ title: "Error occurred", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors disabled:opacity-50"
      title="Delete Product"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
