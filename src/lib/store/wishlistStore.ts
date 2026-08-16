import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WishlistItemType {
  productId: string;
  name: string;
  slug: string;
  brandName?: string;
  price: number;
  salePrice?: number | null;
  image: string;
  rating?: number;
}

interface WishlistStore {
  items: WishlistItemType[];
  addItem: (item: WishlistItemType) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (item: WishlistItemType) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (!get().items.some((i) => i.productId === item.productId)) {
          set({ items: [...get().items, item] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      toggleItem: (item) => {
        if (get().isInWishlist(item.productId)) {
          get().removeItem(item.productId);
        } else {
          get().addItem(item);
        }
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "veloce-wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
