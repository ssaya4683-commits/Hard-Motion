import { db, type Product } from "./db";

export const productService = {
  async getAll() {
    return db.products.toArray();
  },

  async add(product: Product) {
    return db.products.add(product);
  },

  async update(id: number, product: Partial<Product>) {
    return db.products.update(id, product);
  },

  async remove(id: number) {
    return db.products.delete(id);
  },

  async count() {
    return db.products.count();
  },

  async totalStock() {
    const items = await db.products.toArray();

    return items.reduce((total, item) => total + item.stok, 0);
  },

  async totalValue() {
    const items = await db.products.toArray();

    return items.reduce(
      (total, item) =>
        total + item.stok * item.hargaBeli,
      0
    );
  },
};