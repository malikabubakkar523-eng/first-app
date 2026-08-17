import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { broadcastContentUpdate } from "@/lib/sync";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access. Please login as Administrator." }, { status: 403 });
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

    if (!name || !sku || !price) {
      return NextResponse.json({ error: "Name, SKU, and price are required." }, { status: 400 });
    }

    const slug = slugify(name);

    // 1. Safely resolve category ID
    let resolvedCategoryId: string | null = null;
    if (categoryId && categoryId.trim() !== "") {
      const matchedCategory = await db.category.findFirst({
        where: {
          OR: [
            { id: categoryId },
            { slug: categoryId },
            { name: { equals: categoryId, mode: "insensitive" } },
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
    if (brandId && brandId.trim() !== "") {
      const matchedBrand = await db.brand.findFirst({
        where: {
          OR: [
            { id: brandId },
            { slug: brandId },
            { name: { equals: brandId, mode: "insensitive" } },
          ],
        },
      });
      if (matchedBrand) {
        resolvedBrandId = matchedBrand.id;
      }
    }

    // 3. Ensure SKU uniqueness
    let finalSku = sku.trim().toUpperCase();
    const existingSku = await db.product.findUnique({ where: { sku: finalSku } });
    if (existingSku) {
      finalSku = `${finalSku}-${Math.floor(100 + Math.random() * 900)}`;
    }

    // 4. Clean images list
    const validImages = Array.isArray(images) && images.length > 0
      ? images
      : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80"];

    // 5. Clean sizes list
    const validSizes = Array.isArray(sizes) && sizes.length > 0
      ? sizes
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
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : null,
        description: description || "",
        details: details || "",
        isFeatured: Boolean(isFeatured),
        isNew: Boolean(isNew),
        status: status || "ACTIVE",
        images: {
          create: validImages.map((img: any, idx: number) => ({
            url: typeof img === "string" ? img : img.url,
            alt: `${name} view ${idx + 1}`,
            isPrimary: idx === 0,
            order: idx,
          })),
        },
        sizes: {
          create: validSizes.map((s: any) => ({
            size: String(s.size),
            stock: Number(s.stock) || 0,
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
      { error: error?.message || "Failed to create product. Please check input data." },
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
