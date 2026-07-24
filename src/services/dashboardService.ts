import type { Product, Transaction } from "../types";

function isToday(date: string) {
  const today = new Date();
  const value = new Date(date);

  return (
    today.getFullYear() === value.getFullYear() &&
    today.getMonth() === value.getMonth() &&
    today.getDate() === value.getDate()
  );
}

export const dashboardService = {
  getTodaySummary(transactions: Transaction[]) {
    const today = transactions.filter((t) =>
      isToday(t.createdAt)
    );

    const stockIn = today
      .filter((t) => t.type === "IN")
      .reduce((sum, t) => sum + t.quantity, 0);

    const stockOut = today
      .filter((t) => t.type === "OUT")
      .reduce((sum, t) => sum + t.quantity, 0);

    return {
      transactions: today.length,
      stockIn,
      stockOut,
    };
  },

  getTopStock(products: Product[], limit = 5) {
    return [...products]
      .sort((a, b) => b.stock - a.stock)
      .slice(0, limit);
  },

  getLowStock(products: Product[], limit = 5) {
    return [...products]
      .filter(
        (p) =>
          p.stock > 0 &&
          p.stock <= p.minimumStock
      )
      .sort((a, b) => a.stock - b.stock)
      .slice(0, limit);
  },

  getOutOfStock(products: Product[]) {
    return products.filter(
      (p) => p.stock === 0
    );
  },

  getInventoryValue(products: Product[]) {
    return products.reduce(
      (sum, p) =>
        sum + p.purchasePrice * p.stock,
      0
    );
  },
};