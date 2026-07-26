import type { CartItem } from "../hooks/useCart";

export interface SalePayment {
  method: string;
  paidAmount: number;
  customerName?: string;
  notes?: string;
}

export interface SaleRecord {
  id: string;
  invoiceNumber: string;
  customerName: string;
  notes: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  payment: SalePayment;
  createdAt: string;
}

const STORAGE_KEY = "hard-motion-sales";

export const salesService = {
  generateInvoiceNumber() {
    return `INV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  },

  async getAll(): Promise<SaleRecord[]> {
    const sales = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Partial<SaleRecord>[];

    return sales
      .map((sale) => ({
        id: sale.id ?? crypto.randomUUID(),
        invoiceNumber: sale.invoiceNumber ?? sale.id ?? "INV-UNKNOWN",
        customerName: sale.customerName ?? "Walk-in Customer",
        notes: sale.notes ?? "",
        items: sale.items ?? [],
        subtotal: sale.subtotal ?? 0,
        total: sale.total ?? sale.subtotal ?? 0,
        payment: sale.payment ?? { method: "CASH", paidAmount: sale.subtotal ?? 0 },
        createdAt: sale.createdAt ?? new Date(0).toISOString(),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async save({
    items,
    subtotal,
    payment,
  }: Omit<SaleRecord, "id" | "invoiceNumber" | "createdAt" | "total" | "customerName" | "notes">): Promise<SaleRecord> {
    const sale: SaleRecord = {
      id: crypto.randomUUID(),
      invoiceNumber: this.generateInvoiceNumber(),
      customerName: payment.customerName?.trim() || "Walk-in Customer",
      notes: payment.notes?.trim() ?? "",
      items,
      subtotal,
      total: subtotal,
      payment,
      createdAt: new Date().toISOString(),
    };

    const existing = await this.getAll();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([sale, ...existing]));

    return sale;
  },
};
