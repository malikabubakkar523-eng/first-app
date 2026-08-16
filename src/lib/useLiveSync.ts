"use client";

import { useEffect, useRef } from "react";
import { ContentType } from "@/lib/sync";

/**
 * React hook that connects to the live VELOCE sync stream and triggers
 * in-memory refresh callbacks whenever admin publishes/updates content.
 */
export function useLiveSync(
  type: ContentType | "ALL",
  onUpdate: () => void | Promise<void>
) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const lastVersionRef = useRef<number>(Date.now());

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let isMounted = true;

    // 1. Connect to Real-time SSE Stream
    try {
      eventSource = new EventSource("/api/sync/events");

      eventSource.addEventListener("update", (e) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(e.data);
          if (type === "ALL" || data.type === type) {
            console.log(`⚡ [LiveSync Event] Received update for ${data.type}`);
            lastVersionRef.current = data.timestamp || Date.now();
            onUpdateRef.current();
          }
        } catch (err) {
          // ignore
        }
      });

      eventSource.onerror = () => {
        // SSE error / reconnecting handled gracefully in background
      };
    } catch (e) {
      // EventSource not supported
    }

    // 2. Fallback polling + Window Focus Revalidation
    const checkVersion = async () => {
      if (!isMounted) return;
      try {
        const res = await fetch("/api/sync/version", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const targetTimestamp =
            type === "ALL"
              ? data.version
              : data.timestamps?.[type] || data.version;

          if (targetTimestamp && targetTimestamp > lastVersionRef.current) {
            lastVersionRef.current = targetTimestamp;
            console.log(`⚡ [LiveSync Poll] Syncing update for ${type}`);
            onUpdateRef.current();
          }
        }
      } catch (err) {
        // ignore
      }
    };

    const interval = setInterval(checkVersion, 12000);

    const handleFocus = () => {
      checkVersion();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", handleFocus);

    return () => {
      isMounted = false;
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleFocus);
    };
  }, [type]);
}
