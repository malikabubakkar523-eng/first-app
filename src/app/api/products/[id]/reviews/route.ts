import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { userName, rating, comment } = await req.json();
    const session = await getSession();

    if (!userName || !rating || !comment) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const review = await db.review.create({
      data: {
        productId: id,
        userId: session?.id || null,
        userName,
        rating: Math.min(5, Math.max(1, Number(rating))),
        comment,
        isVerified: true,
      },
    });

    // Update product average rating
    const allReviews = await db.review.findMany({
      where: { productId: id },
      select: { rating: true },
    });

    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await db.product.update({
      where: { id },
      data: {
        rating: Number(avg.toFixed(2)),
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Review creation error", error);
    return NextResponse.json({ error: "Failed to post review." }, { status: 500 });
  }
}
