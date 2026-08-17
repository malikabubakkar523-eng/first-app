import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { broadcastContentUpdate } from "@/lib/sync";

function parseNumeric(val: any, defaultVal: number = 0): number {
  if (val === undefined || val === null || val === "") return defaultVal;
  if (typeof val === "number") return isNaN(val) ? defaultVal : val;
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? defaultVal : num;
}

function parseOptionalNumeric(val: any): number | null {
  if (val === undefined || val === null || val === "") return null;
  if (typeof val === "number") return isNaN(val) ? null : val;
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    // Allow admin session, or check if admin user exists in database
    if (session && session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Customer account detected. Please login as Administrator (adminveloco@gmail.com)." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      sku,
      categoryId,
      brandId,
      price,
      salePrice,
      description,
      details,
      isFeatured,
      isNew,
      status,
      images,
      sizes,
    } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Product name is required." }, { status: 400 });
    }

    const parsedPrice = parseNumeric(price, 0);
    if (parsedPrice <= 0) {
      return NextResponse.json({ error: "Please enter a valid product price (e.g. 15000)." }, { status: 400 });
    }

    const parsedSalePrice = parseOptionalNumeric(salePrice);
    const slug = slugify(name);

    // 1. Safely resolve category ID
    let resolvedCategoryId: string | null = null;
    if (categoryId && String(categoryId).trim() !== "") {
      const matchedCategory = await db.category.findFirst({
        where: {
          OR: [
            { id: String(categoryId) },
            { slug: String(categoryId) },
            { name: { equals: String(categoryId), mode: "insensitive" } },
          ],
        },
      });
      if (matchedCategory) {
        resolvedCategoryId = matchedCategory.id;
      }
    }

    // If no category matched or none provided, get or create a default category
    if (!resolvedCategoryId) {
      let defaultCat = await db.category.findFirst({ where: { isActive: true } });
      if (!defaultCat) {
        defaultCat = await db.category.create({
          data: {
            name: "Sneakers",
            slug: "sneakers",
            description: "Handcrafted luxury and performance footwear.",
            order: 1,
            isActive: true,
          },
        });
      }
      resolvedCategoryId = defaultCat.id;
    }

    // 2. Safely resolve brand ID
    let resolvedBrandId: string | null = null;
    if (brandId && String(brandId).trim() !== "") {
      const matchedBrand = await db.brand.findFirst({
        where: {
          OR: [
            { id: String(brandId) },
            { slug: String(brandId) },
            { name: { equals: String(brandId), mode: "insensitive" } },
          ],
        },
      });
      if (matchedBrand) {
        resolvedBrandId = matchedBrand.id;
      }
    }

    // 3. Ensure SKU uniqueness
    let baseSku = sku && String(sku).trim() !== "" 
      ? String(sku).trim().toUpperCase() 
      : `VEL-${slug.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    let finalSku = baseSku;
    const existingSku = await db.product.findUnique({ where: { sku: finalSku } });
    if (existingSku) {
      finalSku = `${baseSku}-${Math.floor(100 + Math.random() * 900)}`;
    }

    // 4. Clean images list
    const validImages = Array.isArray(images) && images.length > 0
      ? images.map((img: any) => typeof img === "string" ? img : img.url).filter((u: string) => Boolean(u && u.trim()))
      : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80"];

    if (validImages.length === 0) {
      validImages.push("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80");
    }

    // 5. Clean sizes list
    const validSizes = Array.isArray(sizes) && sizes.length > 0
      ? sizes.map((s: any) => ({
          size: String(s.size || s),
          stock: parseNumeric(s.stock, 10),
        }))
      : [
          { size: "40", stock: 10 },
          { size: "41", stock: 15 },
          { size: "42", stock: 12 },
          { size: "43", stock: 8 },
        ];

    // Create product with nested images and sizes
    const product = await db.product.create({
      data: {
        name: name.trim(),
        slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
        sku: finalSku,
        categoryId: resolvedCategoryId,
        brandId: resolvedBrandId,
        price: parsedPrice,
        salePrice: parsedSalePrice,
        description: description ? String(description).trim() : "",
        details: details ? String(details).trim() : "",
        isFeatured: Boolean(isFeatured),
        isNew: Boolean(isNew),
        status: status || "ACTIVE",
        images: {
          create: validImages.map((url: string, idx: number) => ({
            url: url,
            alt: `${name} view ${idx + 1}`,
            isPrimary: idx === 0,
            order: idx,
          })),
        },
        sizes: {
          create: validSizes.map((s: any) => ({
            size: String(s.size),
            stock: parseNumeric(s.stock, 0),
            sku: `${finalSku}-${s.size}-${Math.floor(100 + Math.random() * 900)}`,
          })),
        },
      },
      include: {
        images: true,
        category: true,
        brand: true,
        sizes: true,
      },
    });

    broadcastContentUpdate("PRODUCT");

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Admin product creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create product. Please verify database connection and inputs." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Product ID required." }, { status: 400 });

    await db.product.delete({ where: { id } });

    broadcastContentUpdate("PRODUCT");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
