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

  /**
   * Runtime-only variant list hydrated from productSizes.
   * Not stored on the products table.
   */
  variants?: ProductSize[];

  /**
   * Legacy alias used by older product detail screens.
   */
  sizes?: ProductSize[];
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

  /**
   * Optional POS receipt metadata stored on sale stock-out rows.
   * These fields are not indexed and do not change the Dexie schema.
   */
  saleId?: string;
  invoiceNumber?: string;
  customerName?: string;
  sku?: string;
  price?: number;
  subtotal?: number;
  total?: number;
  paymentMethod?: string;
  paidAmount?: number;
  paymentNotes?: string;
  saleCreatedAt?: string;

  createdAt: string;
}
export type SettingKey =
  | "storeName"
  | "currency"
  | "theme"
  | "autoBackup"
  | "storeWhatsapp";

export interface Setting {
  id?: number;

  key: SettingKey;

  value: string;

  createdAt: string;

  updatedAt?: string;

}