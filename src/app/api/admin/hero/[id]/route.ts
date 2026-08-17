import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { broadcastContentUpdate } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { heading, subtitle, badge, imageUrl, videoUrl, mediaType, ctaText, ctaLink, order, isActive } = body;

    const updated = await db.heroBanner.update({
      where: { id },
      data: {
        ...(heading !== undefined && { heading }),
        ...(subtitle !== undefined && { subtitle }),
        ...(badge !== undefined && { badge }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(mediaType !== undefined && { mediaType }),
        ...(ctaText !== undefined && { ctaText }),
        ...(ctaLink !== undefined && { ctaLink }),
        ...(order !== undefined && { order: Number(order) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    broadcastContentUpdate("HERO");

    return NextResponse.json({ success: true, banner: updated });
  } catch (error) {
    console.error("Hero banner update error:", error);
    return NextResponse.json({ error: "Failed to update hero banner." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = params;
    await db.heroBanner.delete({
      where: { id },
    });

    broadcastContentUpdate("HERO");

    return NextResponse.json({ success: true, message: "Hero banner deleted successfully." });
  } catch (error) {
    console.error("Hero banner delete error:", error);
    return NextResponse.json({ error: "Failed to delete hero banner." }, { status: 500 });
  }
}
