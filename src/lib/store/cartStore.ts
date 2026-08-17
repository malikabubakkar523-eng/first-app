import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItemType {
  id: string; // unique identifier e.g. `${productId}-${size}-${color}`
  productId: string;
  name: string;
  slug: string;
  brandName?: string;
  price: number;
  salePrice?: number | null;
  image: string;
  size: string;
  color?: string;
  quantity: number;
  maxStock: number;
}

interface CartStore {
  items: CartItemType[];
  isOpen: boolean;
  appliedCoupon: {
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    discountAmount: number;
  } | null;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItemType, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyCoupon: (coupon: CartStore["appliedCoupon"]) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getShippingFee: (freeThreshold?: number, defaultFee?: number) => number;
  getTotal: (freeThreshold?: number, defaultFee?: number) => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedCoupon: null,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (newItem) => {
        const id = `${newItem.productId}-${newItem.size}-${newItem.color || "default"}`;
        const existing = get().items.find((i) => i.id === id);

        if (existing) {
          const updatedQty = Math.min(existing.quantity + newItem.quantity, newItem.maxStock || 99);
          set({
            items: get().items.map((i) => (i.id === id ? { ...i, quantity: updatedQty } : i)),
            isOpen: true,
          });
        } else {
          set({
            items: [...get().items, { ...newItem, id, quantity: Math.min(newItem.quantity, newItem.maxStock || 99) }],
            isOpen: true,
          });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(quantity, i.maxStock || 99) } : i
          ),
        });
      },

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
      removeCoupon: () => set({ appliedCoupon: null }),
      clearCart: () => set({ items: [], appliedCoupon: null }),

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const effectivePrice = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
          return total + effectivePrice * item.quantity;
        }, 0);
      },

      getDiscount: () => {
        const subtotal = get().getSubtotal();
        const coupon = get().appliedCoupon;
        if (!coupon || subtotal <= 0) return 0;

        if (coupon.discountType === "PERCENTAGE") {
          return (subtotal * coupon.discountValue) / 100;
        }
        return Math.min(coupon.discountValue, subtotal);
      },

      getShippingFee: (freeThreshold = 5000, defaultFee = 250) => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0 || subtotal >= freeThreshold) return 0;
        return defaultFee;
      },

      getTotal: (freeThreshold = 5000, defaultFee = 250) => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        const discount = get().getDiscount();
        const shipping = get().getShippingFee(freeThreshold, defaultFee);
        const taxable = Math.max(0, subtotal - discount);
        const tax = taxable * 0.08; // 8% estimated tax
        return Math.max(0, taxable + shipping + tax);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "veloce-cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
