export type Product = {
  id?: number;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  brand: string;
  size: string;
  color: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  photo?: string;
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
