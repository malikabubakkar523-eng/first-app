import { NextRequest } from "next/server";
import { subscribeToSync, getSyncState } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection handshake with current timestamps
      const initialState = getSyncState();
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify(initialState)}\n\n`)
      );

      // Keep-alive heartbeat every 20s
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch (e) {
          clearInterval(heartbeat);
        }
      }, 20000);

      // Subscribe to live broadcast events
      const unsubscribe = subscribeToSync((type, timestamp) => {
        try {
          const payload = JSON.stringify({ type, timestamp });
          controller.enqueue(encoder.encode(`event: update\ndata: ${payload}\n\n`));
        } catch (e) {
          // Stream closed
          unsubscribe();
          clearInterval(heartbeat);
        }
      });

      req.signal.addEventListener("abort", () => {
        unsubscribe();
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch (e) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
