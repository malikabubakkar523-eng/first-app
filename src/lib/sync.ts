import { revalidatePath } from "next/cache";

export type ContentType =
  | "HERO"
  | "GALLERY"
  | "PRODUCT"
  | "DEAL"
  | "CATEGORY"
  | "SETTINGS";

interface SyncState {
  version: number;
  timestamps: Record<ContentType, number>;
}

// Global in-memory sync version
const globalSyncState: SyncState = {
  version: Date.now(),
  timestamps: {
    HERO: Date.now(),
    GALLERY: Date.now(),
    PRODUCT: Date.now(),
    DEAL: Date.now(),
    CATEGORY: Date.now(),
    SETTINGS: Date.now(),
  },
};

type Listener = (type: ContentType, timestamp: number) => void;
const listeners = new Set<Listener>();

export function getSyncState(): SyncState {
  return globalSyncState;
}

export function subscribeToSync(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Broadcasts a content update across the server, invalidates Next.js cache,
 * and notifies all live connected SSE clients in real-time.
 */
export function broadcastContentUpdate(type: ContentType) {
  const now = Date.now();
  globalSyncState.version = now;
  globalSyncState.timestamps[type] = now;

  // Invalidate Next.js static/ISR cache for affected paths
  try {
    switch (type) {
      case "HERO":
        revalidatePath("/");
        break;
      case "GALLERY":
        revalidatePath("/");
        revalidatePath("/gallery");
        break;
      case "PRODUCT":
      case "CATEGORY":
        revalidatePath("/");
        revalidatePath("/shop");
        revalidatePath("/category", "layout");
        break;
      case "DEAL":
        revalidatePath("/");
        revalidatePath("/shop");
        break;
      default:
        revalidatePath("/");
        break;
    }
  } catch (e) {
    // Next.js cache revalidate catch if running outside request context
  }

  // Notify all connected SSE client tabs
  listeners.forEach((listener) => {
    try {
      listener(type, now);
    } catch (e) {
      listeners.delete(listener);
    }
  });

  console.log(`📡 [RealTime Sync] Content update broadcasted for type: ${type} at ${now}`);
}
