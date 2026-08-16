import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { broadcastContentUpdate } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const product = await db.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { order: "asc" } },
        sizes: true,
        category: true,
        brand: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
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

    // Update product core fields
    const product = await db.product.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        sku: sku || undefined,
        categoryId: categoryId || undefined,
        brandId: brandId !== undefined ? brandId : undefined,
        price: price !== undefined ? Number(price) : undefined,
        salePrice: salePrice !== undefined ? (salePrice ? Number(salePrice) : null) : undefined,
        description: description !== undefined ? description : undefined,
        details: details !== undefined ? details : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        isNew: isNew !== undefined ? Boolean(isNew) : undefined,
        status: status || undefined,
      },
    });

    // If sizes provided, update size stock
    if (sizes && Array.isArray(sizes)) {
      for (const s of sizes) {
        if (s.id) {
          await db.productSize.update({
            where: { id: s.id },
            data: {
              stock: Number(s.stock) || 0,
              sku: s.sku || undefined,
            },
          });
        } else if (s.size) {
          await db.productSize.create({
            data: {
              productId: params.id,
              size: String(s.size),
              stock: Number(s.stock) || 0,
              sku: `${product.sku}-${s.size}`,
            },
          });
        }
      }
    }

    // If images provided, update images
    if (images && Array.isArray(images) && images.length > 0) {
      await db.productImage.deleteMany({ where: { productId: params.id } });
      await db.productImage.createMany({
        data: images.map((img: any, idx: number) => ({
          productId: params.id,
          url: typeof img === "string" ? img : img.url,
          alt: `${product.name} image ${idx + 1}`,
          isPrimary: idx === 0,
          order: idx,
        })),
      });
    }

    broadcastContentUpdate("PRODUCT");

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    // Soft-delete: mark as ARCHIVED to preserve all historical customer orders
    await db.product.update({
      where: { id: params.id },
      data: { status: "ARCHIVED" },
    });

    broadcastContentUpdate("PRODUCT");

    return NextResponse.json({ success: true, message: "Product archived successfully." });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json({ error: "Failed to archive product." }, { status: 500 });
  }
}
