import Dexie, { type Table } from "dexie";
import type { Product, StockTransaction } from "../types";

class HardMotionDatabase extends Dexie {
  products!: Table<Product, number>;
  transactions!: Table<StockTransaction, number>;

  constructor() {
    super("hard-motion-db");
    this.version(2).stores({
      products: "++id, sku, barcode, name, category, brand, stock, minimumStock, sellingPrice, purchasePrice, createdAt, updatedAt",
      transactions: "++id, productId, type, createdAt",
    });
  }
}

export const db = new HardMotionDatabase();
