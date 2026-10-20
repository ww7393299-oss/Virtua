"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
  stock: number;
};

type CartState = {
  items: CartLine[];
  add: (line: CartLine) => void;
  remove: (productId: string, variantId?: string) => void;
  setQty: (productId: string, variantId: string | undefined, qty: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (line) => {
        const items = [...get().items];
        const idx = items.findIndex(
          (i) => i.productId === line.productId && i.variantId === line.variantId
        );
        if (idx > -1) {
          items[idx] = {
            ...items[idx],
            quantity: Math.min(items[idx].quantity + line.quantity, line.stock || 99),
          };
        } else {
          items.push(line);
        }
        set({ items });
      },
      remove: (productId, variantId) =>
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }),
      setQty: (productId, variantId, qty) =>
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: Math.max(1, qty) }
              : i
          ),
        }),
      clear: () => set({ items: [] }),
    }),
    { name: "virtua-cart" }
  )
);

type WishlistState = {
  ids: string[];
  toggle: (productId: string) => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) => {
        const ids = get().ids.includes(productId)
          ? get().ids.filter((id) => id !== productId)
          : [...get().ids, productId];
        set({ ids });
      },
    }),
    { name: "virtua-wishlist" }
  )
);
