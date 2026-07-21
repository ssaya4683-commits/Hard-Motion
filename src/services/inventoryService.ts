import { db } from "../db/db";
import type { Product, TransactionType } from "../types";

const now = () => new Date().toISOString();
export type ProductInput = Omit<Product, "createdAt" | "updatedAt"> & { id?: number };

export const getStockStatus = (product: Pick<Product, "stock" | "minimumStock">) => {
  if (product.stock <= 0) return "out";
  if (product.stock <= product.minimumStock) return "low";
  return "safe";
};

export const inventoryService = {
  async getProducts() {
    const products = await db.products.orderBy("updatedAt").reverse().toArray();
    return products.map((product) => ({
      ...product,
      purchasePrice: product.purchasePrice ?? (product as Product & { costPrice?: number }).costPrice ?? 0,
      sellingPrice: product.sellingPrice ?? (product as Product & { salePrice?: number }).salePrice ?? 0,
      minimumStock: product.minimumStock ?? (product as Product & { minStock?: number }).minStock ?? 0,
      image: product.image ?? (product as Product & { photo?: string }).photo ?? "",
      description: product.description ?? "",
    }));
  },
  getTransactions: () => db.transactions.orderBy("createdAt").reverse().toArray(),
  async isSkuDuplicate(sku: string, currentId?: number) {
    const products = await db.products.toArray();
    const existing = products.find((product) => product.sku.toLowerCase() === sku.trim().toLowerCase());
    return Boolean(existing && existing.id !== currentId);
  },
  async saveProduct(product: ProductInput) {
    const sku = product.sku.trim();
    if (await this.isSkuDuplicate(sku, product.id)) throw new Error("SKU already exists");
    const payload = { ...product, sku, updatedAt: now() };
    if (product.id) return db.products.update(product.id, payload);
    return db.products.add({ ...payload, createdAt: now() });
  },
  deleteProduct: (id: number) => db.products.delete(id),
  async duplicateProduct(product: Product) {
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...copy } = product;
    let sku = `${product.sku}-COPY`;
    let index = 2;
    while (await this.isSkuDuplicate(sku)) sku = `${product.sku}-COPY-${index++}`;
    return this.saveProduct({ ...copy, sku, barcode: product.barcode ? `${product.barcode}-COPY` : "", name: `${product.name} (Copy)` });
  },
  async moveStock(product: Product, type: TransactionType, quantity: number, note: string) {
    if (!product.id) return;
    const nextStock = type === "in" ? product.stock + quantity : Math.max(0, product.stock - quantity);
    await db.transaction("rw", db.products, db.transactions, async () => {
      await db.products.update(product.id!, { stock: nextStock, updatedAt: now() });
      await db.transactions.add({ productId: product.id!, productName: product.name, type, quantity, note, createdAt: now() });
    });
  },
};
