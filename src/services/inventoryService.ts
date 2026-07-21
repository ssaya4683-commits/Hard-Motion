import { db } from "../db/db";
import type { Product, TransactionType } from "../types";

const now = () => new Date().toISOString();

export const inventoryService = {
  async seed() {
    if ((await db.products.count()) > 0) return;
    const products: Product[] = [
      { sku: "HM-TS-001", barcode: "899100000001", name: "Hard Motion Oversized Tee", category: "T-Shirt", brand: "Hard Motion", size: "L", color: "Black", costPrice: 85000, salePrice: 149000, stock: 32, minStock: 8, createdAt: now(), updatedAt: now() },
      { sku: "HM-HD-002", barcode: "899100000002", name: "Hard Motion Hoodie", category: "Hoodie", brand: "Hard Motion", size: "XL", color: "Charcoal", costPrice: 180000, salePrice: 329000, stock: 7, minStock: 10, createdAt: now(), updatedAt: now() },
      { sku: "HM-CP-003", barcode: "899100000003", name: "Motion Cap", category: "Accessories", brand: "Hard Motion", size: "All Size", color: "Olive", costPrice: 45000, salePrice: 99000, stock: 18, minStock: 5, createdAt: now(), updatedAt: now() },
    ];
    await db.products.bulkAdd(products);
    await db.transactions.bulkAdd(products.map((product, index) => ({ productId: index + 1, productName: product.name, type: "in", quantity: product.stock, note: "Stok awal", createdAt: now() })));
  },
  getProducts: () => db.products.orderBy("updatedAt").reverse().toArray(),
  getTransactions: () => db.transactions.orderBy("createdAt").reverse().toArray(),
  async saveProduct(product: Omit<Product, "createdAt" | "updatedAt"> & { id?: number }) {
    if (product.id) return db.products.update(product.id, { ...product, updatedAt: now() });
    return db.products.add({ ...product, createdAt: now(), updatedAt: now() });
  },
  deleteProduct: (id: number) => db.products.delete(id),
  async moveStock(product: Product, type: TransactionType, quantity: number, note: string) {
    if (!product.id) return;
    const nextStock = type === "in" ? product.stock + quantity : Math.max(0, product.stock - quantity);
    await db.transaction("rw", db.products, db.transactions, async () => {
      await db.products.update(product.id!, { stock: nextStock, updatedAt: now() });
      await db.transactions.add({ productId: product.id!, productName: product.name, type, quantity, note, createdAt: now() });
    });
  },
};
