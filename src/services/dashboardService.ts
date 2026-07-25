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
  getRecentTransactions(
  transactions: Transaction[],
  limit = 10
) {
  return [...transactions]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
},

getTopSellingProducts(
  transactions: Transaction[],
  products: Product[],
  limit = 5
) {
  const totals = new Map<number, number>();

  transactions
    .filter((t) => t.type === "OUT")
    .forEach((t) => {
      totals.set(
        t.productId,
        (totals.get(t.productId) ?? 0) + t.quantity
      );
    });

  return [...totals.entries()]
    .map(([productId, sold]) => ({
      product: products.find(
        (p) => p.id === productId
      ),
      sold,
    }))
    .filter((item) => item.product)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, limit);
},

getWeeklyTransactions(
  transactions: Transaction[]
) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));

    return {
      label: date.toLocaleDateString("id-ID", {
        weekday: "short",
      }),
      IN: 0,
      OUT: 0,
      date,
    };
  });

  transactions.forEach((t) => {
    const txDate = new Date(t.createdAt);

    const day = days.find(
      (d) =>
        d.date.getFullYear() === txDate.getFullYear() &&
        d.date.getMonth() === txDate.getMonth() &&
        d.date.getDate() === txDate.getDate()
    );

    if (!day) return;

    if (t.type === "IN") {
      day.IN += t.quantity;
    } else {
      day.OUT += t.quantity;
    }
  });

  return days.map(({ label, IN, OUT }) => ({
    label,
    IN,
    OUT,
  }));
},
};