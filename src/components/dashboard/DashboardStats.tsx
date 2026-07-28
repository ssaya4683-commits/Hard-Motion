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
        <Card
  key={label}
  className="
    border border-slate-200/60
    bg-white
    transition-all
    duration-300
    hover:-translate-y-1
    hover:shadow-xl
    dark:border-slate-700
    dark:bg-slate-900
  "
>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                {label}
              </p>

              <strong className="mt-3 block text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                {value}
              </strong>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
  <Icon className="h-7 w-7 text-white" />
</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
