import type { Product, Transaction } from "../types";

export type DashboardPeriod = "today" | "week" | "month" | "all";

export type SalesChartPoint = {
  label: string;
  sales: number;
};

export type TopSellingProduct = {
  productId: number;
  name: string;
  sku: string;
  quantity: number;
  revenue: number;
};

export type StockCategoryPoint = {
  category: string;
  stock: number;
};

const getStartOfDay = (date = new Date()) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getTransactionAmount = (
  transaction: Transaction,
  product?: Product
) => {
  if (typeof transaction.subtotal === "number") {
    return transaction.subtotal;
  }

  if (typeof transaction.total === "number") {
    return transaction.total;
  }

  if (typeof transaction.price === "number") {
    return transaction.price * transaction.quantity;
  }

  return (product?.sellingPrice ?? 0) * transaction.quantity;
};

const getPeriodStart = (period: DashboardPeriod) => {
  const now = new Date();

  if (period === "today") {
    return getStartOfDay(now);
  }

  if (period === "week") {
    const start = getStartOfDay(now);
    const day = start.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + mondayOffset);
    return start;
  }

  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return null;
};

export const dashboardService = {
  filterTransactionsByPeriod(
    transactions: Transaction[],
    period: DashboardPeriod
  ) {
    const start = getPeriodStart(period);

    if (!start) return transactions;

    return transactions.filter(
      (transaction) => new Date(transaction.createdAt) >= start
    );
  },

  getTodaySummary(
    transactions: Transaction[],
    products: Product[]
  ) {
    const today = getStartOfDay();
    const productById = new Map(
      products.map((product) => [product.id, product])
    );

    const salesTransactions = transactions.filter((transaction) => {
      const createdAt = new Date(transaction.createdAt);
      return transaction.type === "OUT" && isSameDay(createdAt, today);
    });

    return {
      transactions: salesTransactions.length,
      sales: salesTransactions.reduce(
        (sum, transaction) =>
          sum + getTransactionAmount(transaction, productById.get(transaction.productId)),
        0
      ),
    };
  },

  getLowStock(products: Product[], limit?: number) {
    const items = [...products]
      .filter((product) => product.stock > 0 && product.stock <= product.minimumStock)
      .sort((a, b) => a.stock - b.stock);

    return typeof limit === "number" ? items.slice(0, limit) : items;
  },

  getOutOfStock(products: Product[]) {
    return products.filter((product) => product.stock === 0);
  },

  getInventoryValue(products: Product[]) {
    return products.reduce(
      (sum, product) => sum + product.purchasePrice * product.stock,
      0
    );
  },

  getRecentTransactions(transactions: Transaction[], limit = 10) {
    return [...transactions]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);
  },

  getSalesLastSevenDays(
    transactions: Transaction[],
    products: Product[]
  ): SalesChartPoint[] {
    const productById = new Map(products.map((product) => [product.id, product]));

    return Array.from({ length: 7 }, (_, index) => {
      const date = getStartOfDay();
      date.setDate(date.getDate() - (6 - index));

      const sales = transactions
        .filter(
          (transaction) =>
            transaction.type === "OUT" &&
            isSameDay(new Date(transaction.createdAt), date)
        )
        .reduce(
          (sum, transaction) =>
            sum + getTransactionAmount(transaction, productById.get(transaction.productId)),
          0
        );

      return {
        label: date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
        sales,
      };
    });
  },

  getTopSellingProducts(
    transactions: Transaction[],
    products: Product[],
    limit = 10
  ): TopSellingProduct[] {
    const productById = new Map(products.map((product) => [product.id, product]));
    const totals = new Map<number, { quantity: number; revenue: number }>();

    transactions
      .filter((transaction) => transaction.type === "OUT")
      .forEach((transaction) => {
        const current = totals.get(transaction.productId) ?? { quantity: 0, revenue: 0 };
        const product = productById.get(transaction.productId);

        totals.set(transaction.productId, {
          quantity: current.quantity + transaction.quantity,
          revenue: current.revenue + getTransactionAmount(transaction, product),
        });
      });

    return [...totals.entries()]
      .map(([productId, total]) => {
        const product = productById.get(productId);
        return {
          productId,
          name: product?.name ?? "Produk terhapus",
          sku: product?.sku ?? "-",
          ...total,
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  },

  getStockByCategory(products: Product[]): StockCategoryPoint[] {
    const totals = new Map<string, number>();

    products.forEach((product) => {
      const category = product.category || "Tanpa Kategori";
      totals.set(category, (totals.get(category) ?? 0) + product.stock);
    });

    return [...totals.entries()]
      .map(([category, stock]) => ({ category, stock }))
      .sort((a, b) => b.stock - a.stock);
  },
};
