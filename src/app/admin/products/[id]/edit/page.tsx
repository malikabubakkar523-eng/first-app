import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminEditProductForm } from "@/components/admin/AdminEditProductForm";

export const revalidate = 0;

export default async function AdminEditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const [product, categories, brands] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        sizes: { orderBy: { size: "asc" } },
      },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
          PRODUCT EDITOR
        </span>
        <h1 className="text-2xl font-display font-black text-white tracking-tight mt-1">
          Edit {product.name}
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Update prices, size inventory, specifications, and images safely.
        </p>
      </div>

      <AdminEditProductForm
        product={product}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
