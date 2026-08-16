import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { broadcastContentUpdate } from "@/lib/sync";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
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

    if (!name || !sku || !categoryId || !price) {
      return NextResponse.json({ error: "Name, SKU, category and price are required." }, { status: 400 });
    }

    const slug = slugify(name);

    // Create product with nested images and sizes
    const product = await db.product.create({
      data: {
        name,
        slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
        sku,
        categoryId,
        brandId: brandId || null,
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : null,
        description: description || "",
        details: details || "",
        isFeatured: Boolean(isFeatured),
        isNew: Boolean(isNew),
        status: status || "ACTIVE",
        images: {
          create: (images || []).map((img: any, idx: number) => ({
            url: typeof img === "string" ? img : img.url,
            alt: `${name} view ${idx + 1}`,
            isPrimary: idx === 0,
            order: idx,
          })),
        },
        sizes: {
          create: (sizes || []).map((s: any) => ({
            size: String(s.size),
            stock: Number(s.stock) || 0,
            sku: `${sku}-${s.size}`,
          })),
        },
      },
    });

    broadcastContentUpdate("PRODUCT");

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Admin product creation error", error);
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
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
