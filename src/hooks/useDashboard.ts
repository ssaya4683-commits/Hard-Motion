import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import {
  dashboardService,
  type DashboardPeriod,
} from "../services/dashboardService";

export function useDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>("today");

  const analytics =
    useLiveQuery(async () => {
      const [products, transactions] = await Promise.all([
        db.products.toArray(),
        db.transactions.orderBy("createdAt").reverse().toArray(),
      ]);

      return { products, transactions };
    }, []) ?? { products: [], transactions: [] };

  const { products, transactions } = analytics;

  const filteredTransactions = useMemo(
    () => dashboardService.filterTransactionsByPeriod(transactions, period),
    [period, transactions]
  );

  const summary = useMemo(
    () => ({
      today: dashboardService.getTodaySummary(transactions, products),
      todayInsight: dashboardService.getTodayInsight(
  transactions,
  products
),
      inventoryValue: dashboardService.getInventoryValue(products),
      lowStock: dashboardService.getLowStock(products),
      outOfStock: dashboardService.getOutOfStock(products),
      recentTransactions: dashboardService.getRecentTransactions(transactions),
      salesLastSevenDays: dashboardService.getSalesLastSevenDays(
        transactions,
        products
      ),
      topSelling: dashboardService.getTopSellingProducts(
        filteredTransactions,
        products
      ),
      stockByCategory: dashboardService.getStockByCategory(products),
    }),
    [filteredTransactions, products, transactions]
  );

  return {
    products,
    transactions,
    period,
    setPeriod,
    filteredTransactions,
    ...summary,
  };
}
