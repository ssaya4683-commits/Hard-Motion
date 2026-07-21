import Dexie, { type Table } from "dexie";
import type { Product, StockTransaction } from "../types";

class HardMotionDatabase extends Dexie {
  products!: Table<Product, number>;
  transactions!: Table<StockTransaction, number>;

  constructor() {
    super("hard-motion-db");
    this.version(1).stores({
      products: "++id, sku, barcode, name, category, brand, stock, minStock, updatedAt",
      transactions: "++id, productId, type, createdAt",
    });
  }
}

export const db = new HardMotionDatabase();
