import {
  Activity,
  AlertTriangle,
  Boxes,
  Package,
  ReceiptText,
  Wallet,
} from "lucide-react";

import { Card } from "../common/Card";
import { formatCurrency } from "../../utils/format";
import type { Product } from "../../types";

type Props = {
  products: Product[];
  inventoryValue: number;
  lowStock: Product[];
  todaySales: number;
  todayTransactions: number;
};

export function DashboardStats({
  products,
  inventoryValue,
  lowStock,
  todaySales,
  todayTransactions,
}: Props) {
  const stats = [
    ["Total Produk", products.length, Package],
    ["Total Stok", products.reduce((sum, product) => sum + product.stock, 0), Boxes],
    ["Nilai Persediaan", formatCurrency(inventoryValue), Activity],
    ["Penjualan Hari Ini", formatCurrency(todaySales), Wallet],
    ["Transaksi Hari Ini", todayTransactions, ReceiptText],
    ["Produk Hampir Habis", lowStock.length, AlertTriangle],
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map(([label, value, Icon]) => (
        <Card key={label} className="bg-gradient-to-br from-white to-amber-50/60 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>

              <strong className="mt-2 block text-2xl font-black text-slate-950 dark:text-white">
                {value}
              </strong>
            </div>

            <div className="rounded-2xl bg-amber-500/10 p-3">
              <Icon className="text-amber-700 dark:text-amber-400" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
