import { db } from "../db/db";
import type { Product, ProductSize } from "../types";

const BARCODE_LENGTH = 13;

async function hydrateProductVariants(product: Product): Promise<Product> {
  if (product.id == null) {
    return { ...product, variants: [] };
  }

  const variants: ProductSize[] = await db.productSizes
    .where("productId")
    .equals(product.id)
    .sortBy("size");

  const stock = variants.length
    ? variants.reduce((total, variant) => total + variant.stock, 0)
    : product.stock;

  return {
    ...product,
    stock,
    variants,
    sizes: variants,
  };
}

function randomDigits(length: number) {
  let result = "";

  while (result.length < length) {
    result += Math.floor(Math.random() * 10);
  }

  return result.substring(0, length);
}

export const barcodeService = {
  async isBarcodeDuplicate(
    barcode: string,
    currentId?: number
  ) {
    const value = barcode.trim();

    if (!value) return false;

    const products = await db.products.toArray();

    return products.some(
      (product) =>
        String((product as any).barcode ?? "").trim() === value &&
        product.id !== currentId
    );
  },

  async searchByBarcode(
    barcode: string
  ): Promise<Product | undefined> {
    const value = barcode.trim();

    if (!value) return undefined;

    const product = await db.products
      .where("barcode")
      .equals(value)
      .first();

    return product ? hydrateProductVariants(product) : undefined;
  },

  async getProductByBarcode(
    barcode: string
  ): Promise<Product | undefined> {
    return this.searchByBarcode(barcode);
  },

  async generateBarcode() {
    while (true) {
      const barcode = randomDigits(BARCODE_LENGTH);

      const exists =
        await this.isBarcodeDuplicate(barcode);

      if (!exists) {
        return barcode;
      }
    }
  },

  async searchProducts(keyword: string) {
    const value = keyword.trim().toLowerCase();

    const products = await db.products.toArray();

    if (!value) {
      return products;
    }

    return products.filter((product) => {
      const name = product.name.toLowerCase();
      const sku = product.sku.toLowerCase();
      const barcode = String(
        (product as any).barcode ?? ""
      ).toLowerCase();

      return (
        name.includes(value) ||
        sku.includes(value) ||
        barcode.includes(value)
      );
    });
  },
};