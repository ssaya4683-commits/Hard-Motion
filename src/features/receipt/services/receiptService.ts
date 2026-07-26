import { db } from "../../../db/db";
import type { Transaction } from "../../../types";

export interface ReceiptItem {
  productId: number;
  productName: string;
  sku: string;
  size?: number;
  quantity: number;
  price: number;
}

export interface ReceiptSale {
  id: string;
  invoiceNumber: string;
  customerName: string;
  notes: string;
  items: ReceiptItem[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  paidAmount: number;
  createdAt: string;
}

const getRowTotal = (row: Transaction) => (row.price ?? 0) * row.quantity;

export const receiptService = {
  async getBySaleId(saleId: string): Promise<ReceiptSale | null> {
    const rows = await db.transactions
      .filter((transaction) => transaction.saleId === saleId)
      .toArray();

    if (!rows.length) {
      return null;
    }

    const [firstRow] = rows;
    const calculatedTotal = rows.reduce((total, row) => total + getRowTotal(row), 0);

    return {
      id: saleId,
      invoiceNumber: firstRow.invoiceNumber ?? saleId,
      customerName: firstRow.customerName ?? "Walk-in Customer",
      notes: firstRow.paymentNotes ?? "",
      items: rows.map((row) => ({
        productId: row.productId,
        productName: row.productName ?? "Produk",
        sku: row.sku ?? "-",
        size: row.size,
        quantity: row.quantity,
        price: row.price ?? 0,
      })),
      subtotal: firstRow.subtotal ?? calculatedTotal,
      total: firstRow.total ?? calculatedTotal,
      paymentMethod: firstRow.paymentMethod ?? "CASH",
      paidAmount: firstRow.paidAmount ?? firstRow.total ?? calculatedTotal,
      createdAt: firstRow.saleCreatedAt ?? firstRow.createdAt,
    };
  },
};
