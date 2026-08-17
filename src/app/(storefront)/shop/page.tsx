import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ShopFiltersClient } from "@/components/shop/ShopFiltersClient";
import { Sparkles, ArrowRight } from "lucide-react";

export const revalidate = 0;

interface ShopPageProps {
  searchParams: {
    search?: string;
    category?: string;
    brand?: string;
    size?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    deal?: string;
    featured?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { search, category, brand, size, minPrice, maxPrice, sort = "featured", deal, featured } = searchParams;

  const where: any = {
    status: "ACTIVE",
  };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { sku: { contains: search } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (brand) {
    where.brand = { slug: brand };
  }

  if (size) {
    where.sizes = {
      some: {
        size: size,
        stock: { gt: 0 },
      },
    };
  }

  if (deal === "true") {
    where.salePrice = { not: null, gt: 0 };
  }

  if (featured === "true") {
    where.isFeatured = true;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-low") orderBy = { price: "asc" };
  else if (sort === "price-high") orderBy = { price: "desc" };
  else if (sort === "rating") orderBy = { rating: "desc" };
  else if (sort === "newest") orderBy = { createdAt: "desc" };
  else if (sort === "featured") orderBy = [{ isFeatured: "desc" }, { rating: "desc" }];

  let products: any[] = [];
  let categories: any[] = [];
  let brands: any[] = [];

  try {
    const data = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        include: {
          images: { orderBy: { order: "asc" } },
          category: true,
          brand: true,
          sizes: true,
        },
      }),
      db.category.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
      db.brand.findMany({ orderBy: { name: "asc" } }),
    ]);
    products = data[0];
    categories = data[1];
    brands = data[2];
  } catch (error) {
    console.warn("⚠️ ShopPage data query fallback:", error);
  }

  return (
    <div className="space-y-8 pb-16">
      {/* 1. TOP CINEMATIC CAMPAIGN BANNER (Nike Air Max 90 on Mountain Landscape) */}
      <div className="relative w-full overflow-hidden bg-zinc-950 text-white min-h-[260px] sm:min-h-[340px] lg:min-h-[380px] flex items-center border-b border-zinc-200 dark:border-zinc-800">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/shop-banner.png"
            alt="New Arrivals Fresh Styles Bold Moves"
            fill
            priority
            sizes="100vw"
            className="object-cover object-right md:object-center opacity-90 brightness-95 dark:brightness-90"
          />
          {/* Subtle directional gradient mask on left for high contrast typography */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 md:via-zinc-950/30 to-transparent z-[1]" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-950/60 to-transparent z-[1]" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 sm:py-12">
          <div className="max-w-xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 backdrop-blur-md text-brand-400 text-[11px] font-bold uppercase tracking-wider border border-zinc-700/80 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>NEW ARRIVALS • SPRING/SUMMER 2026</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white tracking-tight leading-[1.08]">
              FRESH STYLES. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                BOLD MOVES.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-200 sm:text-zinc-300 leading-relaxed max-w-md">
              Step into the new season with premium comfort and effortless style. High performance meets runway aesthetics.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/shop?sort=newest"
                className="px-6 py-2.5 sm:px-7 sm:py-3 rounded-full bg-white text-zinc-950 hover:bg-zinc-100 text-xs font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>SHOP NEW ARRIVALS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-xs font-mono text-zinc-300">
                {products.length} {products.length === 1 ? "Pair" : "Pairs Available"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CATALOG WITH FILTERS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-xs text-zinc-400 py-12 text-center">Loading filters...</div>}>
          <ShopFiltersClient
            categories={categories}
            brands={brands}
            productsCount={products.length}
            currentParams={searchParams}
          >
            {products.length === 0 ? (
              <div className="col-span-full py-20 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-8">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">No footwear matched your filters</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your price range, clearing category filters, or searching for broader terms.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </ShopFiltersClient>
        </Suspense>
      </div>
    </div>
  );
}
