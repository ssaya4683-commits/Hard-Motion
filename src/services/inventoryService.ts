import { db } from "../db/db";
import {
  createAutoBackup,
} from "./backupService";

import type {
  Product,
  ProductImage,
  ProductSize,
  Transaction,
  TransactionType,
} from "../types";
import { barcodeService } from "./barcodeService";


const now = () => new Date().toISOString();

const normalizeProduct = (product: Product): Product => ({
  ...product,

  barcode: String((product as any).barcode ?? "").trim(),

  purchasePrice:
    product.purchasePrice ??
    (product as any).costPrice ??
    0,

  sellingPrice:
    product.sellingPrice ??
    (product as any).salePrice ??
    0,

  minimumStock:
    product.minimumStock ??
    (product as any).minStock ??
    0,

  image:
    product.image ??
    (product as any).photo ??
    "",

  description:
    product.description ??
    "",
});

const getStockByProductId = (sizes: ProductSize[]) => {
  return sizes.reduce<Record<number, number>>(
    (totals, size) => {
      totals[size.productId] =
        (totals[size.productId] ?? 0) + size.stock;

      return totals;
    },
    {}
  );
};

const getConsistentStock = (
  product: Product,
  stockByProductId: Record<number, number>
) => {
  if (product.id == null) {
    return product.stock;
  }

  return stockByProductId[product.id] ?? product.stock;
};

export interface CatalogProduct extends Product {
  sizes: ProductSize[];
  totalStock: number;
  coverImage: string;
}

export type ProductInput = Omit<
  Product,
  "createdAt" | "updatedAt" | "variants" | "sizes"
> & {
  id?: number;

  sizes?: Omit<
    ProductSize,
    "id" | "productId"
  >[];
};

export const getStockStatus = (
  product: Pick<
    Product,
    "stock" | "minimumStock"
  >
) => {
  if (product.stock <= 0)
    return "out";

  if (
    product.stock <=
    product.minimumStock
  )
    return "low";

  return "safe";
};

export const inventoryService = {
  /*
   |--------------------------------------------------------------------------
   | PRODUCTS
   |--------------------------------------------------------------------------
   */

  async getProducts() {
    const [products, sizes] = await Promise.all([
      db.products.orderBy("updatedAt").reverse().toArray(),
      db.productSizes.toArray(),
    ]);

    const stockByProductId = getStockByProductId(sizes);

    return products.map((product) => {
      const normalized = normalizeProduct(product);

      return {
        ...normalized,
        stock: getConsistentStock(normalized, stockByProductId),
      };
    });
  },

  async getCatalogProducts(): Promise<CatalogProduct[]> {
    const [rawProducts, sizes, images] = await Promise.all([
      db.products.orderBy("updatedAt").reverse().toArray(),
      db.productSizes.toArray(),
      db.productImages.toArray(),
    ]);
    const stockByProductId = getStockByProductId(sizes);
    const products = rawProducts.map((product) => {
      const normalized = normalizeProduct(product);

      return {
        ...normalized,
        stock: getConsistentStock(normalized, stockByProductId),
      };
    });

    const sizesByProductId = new Map<number, ProductSize[]>();

    for (const size of sizes) {
      const productSizes = sizesByProductId.get(size.productId) ?? [];
      productSizes.push(size);
      sizesByProductId.set(size.productId, productSizes);
    }

    const imagesByProductId = new Map<number, ProductImage[]>();

    for (const image of images) {
      const productImages = imagesByProductId.get(image.productId) ?? [];
      productImages.push(image);
      imagesByProductId.set(image.productId, productImages);
    }

    return products.map((product) => {
      const productId = product.id;
      const productSizes = productId == null
        ? []
        : [...(sizesByProductId.get(productId) ?? [])].sort(
            (a, b) => a.size - b.size
          );
      const productImages = productId == null
        ? []
        : imagesByProductId.get(productId) ?? [];
      const cover =
        productImages.find((image) => image.isCover) ?? productImages[0];
      const totalStock = productSizes.length
        ? productSizes.reduce((total, size) => total + size.stock, 0)
        : product.stock;

      return {
        ...product,
        stock: totalStock,
        sizes: productSizes,
        variants: productSizes,
        totalStock,
        coverImage: cover?.image || product.image || "/no-image.png",
      };
    });
  },

  async getProductById(id: number) {
    const [product, sizes] = await Promise.all([
      db.products.get(id),
      this.getSizes(id),
    ]);

    if (!product) {
      return undefined;
    }

    const normalized = normalizeProduct(product);

    return {
      ...normalized,
      stock: sizes.length
        ? sizes.reduce((total, size) => total + size.stock, 0)
        : normalized.stock,
      variants: sizes,
      sizes,
    };
  },

  async getTransactions() {
    return db.transactions
      .orderBy("createdAt")
      .reverse()
      .toArray();
  },

  async isSkuDuplicate(
    sku: string,
    currentId?: number
  ) {
    const products =
      await db.products.toArray();

    const existing =
      products.find(
        (item) =>
          item.sku.toLowerCase() ===
          sku
            .trim()
            .toLowerCase()
      );

    return Boolean(
      existing &&
        existing.id !== currentId
    );
  },
    async saveProduct(
    product: ProductInput
  ) {
    const sku = product.sku.trim();

    if (
      await this.isSkuDuplicate(
        sku,
        product.id
      )
    ) {
      throw new Error(
        "SKU already exists"
      );
    }
    const barcode = String(
  product.barcode ?? ""
).trim();

if (
  await barcodeService.isBarcodeDuplicate(
    barcode,
    product.id
  )
) {
  throw new Error(
    "Barcode already exists"
  );
}

    const {
      sizes = [],
      ...productData
    } = product;

    const payload = {
  ...productData,

  
  barcode,

  sku,

  updatedAt: now(),
};

    /*
     |--------------------------------------------------------------------------
     | UPDATE PRODUCT
     |--------------------------------------------------------------------------
     */

    if (product.id) {
  try {
    await db.transaction(
      "rw",
      db.products,
      db.productSizes,
      async () => {
        await db.products.update(
          product.id!,
          payload
        );

        await this.saveSizes(
          product.id!,
          sizes
        );
      }
    );

    await createAutoBackup();
  } catch (error) {
    console.error(
      "TRANSACTION ERROR",
      error
    );
    throw error;
  }

  return;
}

    /*
     |--------------------------------------------------------------------------
     | CREATE PRODUCT
     |--------------------------------------------------------------------------
     */

    const productId =
      await db.transaction(
        "rw",
        db.products,
        db.productSizes,
        async () => {
          const id =
            await db.products.add({
              ...payload,

              createdAt: now(),
            });

          if (sizes.length) {
            await this.saveSizes(
              Number(id),
              sizes
            );
          }

          return id;
        }
      );

    return productId;
  },

  async deleteProduct(
    id: number
  ) {
    await db.transaction(
      "rw",
      db.products,
      db.productImages,
      db.productSizes,
      async () => {
        await db.products.delete(id);

        await db.productImages
          .where("productId")
          .equals(id)
          .delete();

        await db.productSizes
          .where("productId")
          .equals(id)
          .delete();
      }
    );
  },

  async duplicateProduct(
    product: Product
  ) {
    const {
      id,
      createdAt,
      updatedAt,
      ...copy
    } = product;

    let sku =
      `${product.sku}-COPY`;

    let index = 2;

    while (
      await this.isSkuDuplicate(
        sku
      )
    ) {
      sku =
        `${product.sku}-COPY-${index++}`;
    }

    return this.saveProduct({
      ...copy,

      sku,

      barcode: product.barcode
        ? `${product.barcode}-COPY`
        : "",

      name:
        `${product.name} (Copy)`,

      sizes: [],
    });
  },

  /*
   |--------------------------------------------------------------------------
   | STOCK
   |--------------------------------------------------------------------------
   */
    async moveStock({
  product,
  size,
  type,
  quantity,
  note,
  transactionMeta,
}: {
  product: Product;
  size: number;
  type: TransactionType;
  quantity: number;
  note: string;
  transactionMeta?: Partial<Transaction>;
}) {
  const productId = product.id;

  if (productId == null) {
    throw new Error("Product ID is missing.");
  }

  const sizes = await this.getSizes(productId);

  const selected = sizes.find(
    (item) => item.size === size
  );

  if (!selected) {
    throw new Error("Ukuran tidak ditemukan.");
  }

  if (
  type === "OUT" &&
  quantity > selected.stock
) {
  throw new Error(
    `Stok ukuran ${size} hanya tersedia ${selected.stock} pasang.`
  );
}

const nextSizeStock =
  type === "IN"
    ? selected.stock + quantity
    : selected.stock - quantity;

  await db.transaction(
    "rw",
    db.products,
    db.productSizes,
    db.transactions,
    async () => {
      await db.productSizes.update(
        selected.id!,
        {
          stock: nextSizeStock,
        }
      );

      const totalStock =
        await this.getTotalStock(productId);

      await db.products.update(
        productId,
        {
          stock: totalStock,
          updatedAt: now(),
        }
      );

      await db.transactions.add({
        ...transactionMeta,
        productId,
        productName: product.name,
        size,
        type,
        quantity,
        note,
        createdAt: transactionMeta?.createdAt ?? now(),
      } as Transaction);
    }
  );
  await createAutoBackup();
},

  /*
   |--------------------------------------------------------------------------
   | PRODUCT IMAGES
   |--------------------------------------------------------------------------
   */

  async getImages(
    productId: number
  ) {
    return db.productImages
      .where("productId")
      .equals(productId)
      .toArray();
  },

  async saveImages(
    productId: number,
    images: Omit<
      ProductImage,
      "id" | "productId"
    >[]
  ) {
    await db.productImages
      .where("productId")
      .equals(productId)
      .delete();

    if (!images.length) {
      return;
    }

    await db.productImages.bulkAdd(
      images.map((image) => ({
        ...image,
        productId,
      }))
    );
  },

  async deleteImages(
    productId: number
  ) {
    return db.productImages
      .where("productId")
      .equals(productId)
      .delete();
  },

  /*
   |--------------------------------------------------------------------------
   | PRODUCT SIZES
   |--------------------------------------------------------------------------
   */
    async getSizes(
    productId: number
  ) {
    return db.productSizes
      .where("productId")
      .equals(productId)
      .sortBy("size");
  },

  async saveSizes(
    productId: number,
    sizes: Omit<
      ProductSize,
      "id" | "productId"
    >[]
  ) {
    await db.productSizes
      .where("productId")
      .equals(productId)
      .delete();

    if (!sizes.length) {
      return;
    }

    await db.productSizes.bulkAdd(
      sizes.map((size) => ({
        ...size,

        productId,

        createdAt:
          size.createdAt ||
          now(),
      }))
    );

    const totalStock =
      sizes.reduce(
        (total, item) =>
          total + item.stock,
        0
      );

    await db.products.update(
      productId,
      {
        stock: totalStock,
        updatedAt: now(),
      }
    );
  },

  async updateSizeStock(
    productId: number,
    size: number,
    quantity: number
  ) {
    const record =
      await db.productSizes
        .where({
          productId,
          size,
        })
        .first();

    if (!record) {
      return;
    }

    await db.productSizes.update(
      record.id!,
      {
        stock: quantity,
      }
    );

    const totalStock =
      await this.getTotalStock(
        productId
      );

    await db.products.update(
      productId,
      {
        stock: totalStock,
        updatedAt: now(),
      }
    );
  },

  async getTotalStock(
    productId: number
  ) {
    const sizes =
      await this.getSizes(
        productId
      );

    return sizes.reduce(
      (total, item) =>
        total + item.stock,
      0
    );
  },
  async getProduct(id: number) {
  const products = await this.getProducts();

  return products.find(
    (product) => product.id === id
  );
}
};