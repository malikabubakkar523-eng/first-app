import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";
    const sort = searchParams.get("sort") || "featured";
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const isFeatured = searchParams.get("featured") === "true";
    const isDeal = searchParams.get("deal") === "true";
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;

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

    if (isFeatured) {
      where.isFeatured = true;
    }

    if (isDeal) {
      where.salePrice = { not: null, gt: 0 };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-low") orderBy = { price: "asc" };
    else if (sort === "price-high") orderBy = { price: "desc" };
    else if (sort === "rating") orderBy = { rating: "desc" };
    else if (sort === "newest") orderBy = { createdAt: "desc" };
    else if (sort === "featured") orderBy = [{ isFeatured: "desc" }, { rating: "desc" }];

    const products = await db.product.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        images: { orderBy: { order: "asc" } },
        category: true,
        brand: true,
        sizes: true,
      },
    });

    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error("Products API error", error);
    return NextResponse.json({ error: "Failed to fetch products." }, { status: 500 });
  }
}
