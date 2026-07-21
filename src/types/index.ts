export type Product = {
  id?: number;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  brand: string;
  size: string;
  color: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minimumStock: number;
  image?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type TransactionType = "in" | "out";

export type StockTransaction = {
  id?: number;
  productId: number;
  productName: string;
  type: TransactionType;
  quantity: number;
  note: string;
  createdAt: string;
};
