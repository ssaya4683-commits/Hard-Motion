export interface Product {
  id?: number;

  sku: string;
  barcode: string;

  name: string;
  category: string;
  brand: string;

  purchasePrice: number;
  sellingPrice: number;

  /**
   * Legacy field
   * Akan dihapus setelah migrasi selesai
   */
  stock: number;
  minimumStock: number;
  size: string;

  color: string;
  image: string;
  description: string;

  createdAt: string;
  updatedAt?: string;
}

export interface ProductImage {
  id?: number;

  productId: number;

  image: string;

  isCover: boolean;

  createdAt: string;
}

export interface ProductSize {
  id?: number;

  productId: number;

  size: number;

  stock: number;

  createdAt: string;
}

export type TransactionType =
  | "IN"
  | "OUT"
  | "ADJUSTMENT";

export interface Transaction {
  id?: number;

  productId: number;

  /**
   * Legacy
   * Dipakai History dan Dashboard lama
   */
  productName?: string;

  size?: number;

  type: TransactionType;

  quantity: number;

  note?: string;

  createdAt: string;
}