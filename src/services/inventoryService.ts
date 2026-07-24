import { db } from "../db/db";

import type {
  Product,
  ProductImage,
  ProductSize,
  Transaction,
  TransactionType,
} from "../types";

const now = () => new Date().toISOString();

export type ProductInput = Omit<
  Product,
  "createdAt" | "updatedAt"
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
    const products =
      await db.products
        .orderBy("updatedAt")
        .reverse()
        .toArray();

    return products.map(
      (product) => ({
        ...product,

        purchasePrice:
          product.purchasePrice ??
          (product as any)
            .costPrice ??
          0,

        sellingPrice:
          product.sellingPrice ??
          (product as any)
            .salePrice ??
          0,

        minimumStock:
          product.minimumStock ??
          (product as any)
            .minStock ??
          0,

        image:
          product.image ??
          (product as any)
            .photo ??
          "",

        description:
          product.description ??
          "",
      })
    );
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

    const {
      sizes = [],
      ...productData
    } = product;

    const payload = {
      ...productData,

      sku,

      updatedAt: now(),
    };

    /*
     |--------------------------------------------------------------------------
     | UPDATE PRODUCT
     |--------------------------------------------------------------------------
     */

    if (product.id) {
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
}: {
  product: Product;
  size: number;
  type: TransactionType;
  quantity: number;
  note: string;
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

  const nextSizeStock =
    type === "IN"
      ? selected.stock + quantity
      : Math.max(
          0,
          selected.stock - quantity
        );

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
        productId,
        productName: product.name,
        size,
        type,
        quantity,
        note,
        createdAt: now(),
      } as Transaction);
    }
  );
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
};