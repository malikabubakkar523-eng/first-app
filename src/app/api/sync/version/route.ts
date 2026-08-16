import { NextResponse } from "next/server";
import { getSyncState } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = getSyncState();
  return NextResponse.json(
    {
      success: true,
      ...state,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
