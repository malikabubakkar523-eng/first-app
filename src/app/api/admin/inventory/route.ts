import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const { sizeId, stock } = await req.json();

    if (!sizeId || stock === undefined) {
      return NextResponse.json({ error: "sizeId and stock are required." }, { status: 400 });
    }

    const updated = await db.productSize.update({
      where: { id: sizeId },
      data: { stock: Math.max(0, Number(stock)) },
    });

    return NextResponse.json({ success: true, size: updated });
  } catch (error) {
    console.error("Inventory update error", error);
    return NextResponse.json({ error: "Failed to update inventory stock." }, { status: 500 });
  }
}
