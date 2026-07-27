import Dexie from "dexie";
import type { Table } from "dexie";
import type {
  Product,
  ProductImage,
  ProductSize,
  Setting,
  Transaction,
} from "../types";

class HardMotionDB extends Dexie {
  products!: Table<Product, number>;
  transactions!: Table<Transaction, number>;

  productImages!: Table<ProductImage, number>;
  productSizes!: Table<ProductSize, number>;

  settings!: Table<Setting, number>;

  constructor() {
    super("hard-motion-db");

    /**
     * VERSION 1
     */
    this.version(1).stores({
      products:
        "++id,sku,barcode,name,category,brand,stock,minimumStock,createdAt",

      transactions:
        "++id,productId,type,createdAt",
    });

    /**
     * VERSION 2
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

    /**
     * VERSION 3
     */
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

    /**
     * VERSION 4
     */
    this.version(4).stores({
      products:
        "++id,sku,barcode,name,category,brand,stock,minimumStock,createdAt,updatedAt",

      transactions:
        "++id,productId,type,size,createdAt",

      productImages:
        "++id,productId,isCover,createdAt",

      productSizes:
        "++id,productId,size,stock",
    });

    /**
     * VERSION 5
     * Application Settings
     */
    this.version(5).stores({
      products:
        "++id,sku,barcode,name,category,brand,stock,minimumStock,createdAt,updatedAt",

      transactions:
        "++id,productId,type,size,createdAt",

      productImages:
        "++id,productId,isCover,createdAt",

      productSizes:
        "++id,productId,size,stock",

      settings:
        "++id,&key,createdAt",
    });
  }
}

export const db = new HardMotionDB();