import { db } from "../db/db";
import type { Product } from "../types";

const BARCODE_LENGTH = 13;

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

  async getProductByBarcode(
    barcode: string
  ): Promise<Product | undefined> {
    const value = barcode.trim();

    if (!value) return undefined;

    const products = await db.products.toArray();

    return products.find(
      (product) =>
        String((product as any).barcode ?? "").trim() === value
    );
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