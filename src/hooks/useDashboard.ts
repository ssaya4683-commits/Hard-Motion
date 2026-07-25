import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { dashboardService } from "../services/dashboardService";

export function useDashboard() {
  const products =
    useLiveQuery(() => db.products.toArray(), []) ?? [];

  const transactions =
    useLiveQuery(
      () =>
        db.transactions
          .orderBy("createdAt")
          .reverse()
          .toArray(),
      []
    ) ?? [];

  return {
    products,
    transactions,

    today: dashboardService.getTodaySummary(
      transactions
    ),

    inventoryValue:
      dashboardService.getInventoryValue(
        products
      ),

    lowStock:
      dashboardService.getLowStock(products),

    topStock:
      dashboardService.getTopStock(products),

    outOfStock:
      dashboardService.getOutOfStock(products),

    recentTransactions:
      dashboardService.getRecentTransactions(
        transactions
      ),

    weeklyTransactions:
      dashboardService.getWeeklyTransactions(
        transactions
      ),

    topSelling:
      dashboardService.getTopSellingProducts(
        transactions,
        products
      ),
  };
}