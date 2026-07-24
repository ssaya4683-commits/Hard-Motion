import Dexie from "dexie";
import type { Table } from "dexie";
import type {
  Product,
  ProductImage,
  ProductSize,
  Transaction,
} from "../types";

class HardMotionDB extends Dexie {
  products!: Table<Product, number>;
  transactions!: Table<Transaction, number>;

  // New Tables
  productImages!: Table<ProductImage, number>;
  productSizes!: Table<ProductSize, number>;

  constructor() {
    super("hard-motion-db");

    /**
     * VERSION 1
     * Database lama
     */
    this.version(1).stores({
      products:
        "++id,sku,barcode,name,category,brand,stock,minimumStock,createdAt",

      transactions:
        "++id,productId,type,createdAt",
    });

    /**
     * VERSION 2
     * Tambahan untuk Hard Motion v2
     */
    this.version(2).stores({
      products:
        "++id,sku,barcode,name,category,brand,stock,minimumStock,createdAt",

      transactions:
        "++id,productId,type,variantId,size,createdAt",

      productImages:
        "++id,productId,isCover,createdAt",

      productSizes:
        "++id,variantId,size,stock",
    });
    this.version(3).stores({
  products:
    "++id,sku,barcode,name,category,brand,stock,minimumStock,createdAt",

  transactions:
    "++id,productId,type,size,createdAt",

  productImages:
    "++id,productId,isCover,createdAt",

  productSizes:
    "++id,productId,size,stock",
});
  }
}


export const db = new HardMotionDB();