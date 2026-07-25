import type { CartItem } from "../hooks/useCart";

export interface SalePayment {
  method: string;
  paidAmount: number;
}

export interface SaleRecord {
  id: string;
  items: CartItem[];
  subtotal: number;
  payment: SalePayment;
  createdAt: string;
}

const STORAGE_KEY = "hard-motion-sales";

export const salesService = {
  async save({
    items,
    subtotal,
    payment,
  }: Omit<SaleRecord, "id" | "createdAt">) {
    const sale: SaleRecord = {
      id: crypto.randomUUID(),
      items,
      subtotal,
      payment,
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as SaleRecord[];
    localStorage.setItem(STORAGE_KEY, JSON.stringify([sale, ...existing]));

    return sale;
  },
};
