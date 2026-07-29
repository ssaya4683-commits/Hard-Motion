import { useMemo, useState } from "react";

import type { Product } from "../../../types";

export interface CartItem {
  productId: number;
  productName: string;
  sku: string;
  size: number;
  quantity: number;
  price: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, size: number, price = product.sellingPrice) => {
    if (product.id == null) {
      return;
    }

    setItems((current) => {
      const existing = current.find(
        (item) => item.productId === product.id && item.size === size
      );

      if (existing) {
        return current.map((item) =>
          item.productId === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...current,
        {
          productId: product.id!,
          productName: product.name,
          sku: product.sku,
          size,
          quantity: 1,
          price,
        },
      ];
    });
  };

  const updateQuantity = (productId: number, size: number, quantity: number) => {
    const nextQuantity = Math.max(1, quantity);

    setItems((current) =>
      current.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity: nextQuantity }
          : item
      )
    );
  };

  const removeItem = (productId: number, size: number) => {
    setItems((current) =>
      current.filter((item) => !(item.productId === productId && item.size === size))
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items]
  );

  return {
    items,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
