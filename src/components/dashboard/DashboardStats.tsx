import {
  Activity,
  AlertTriangle,
  Boxes,
  Package,
} from "lucide-react";

import { Card } from "../common/Card";
import { formatCurrency } from "../../utils/format";
import type { Product } from "../../types";

type Props = {
  products: Product[];
  inventoryValue: number;
  lowStock: Product[];
};

export function DashboardStats({
  products,
  inventoryValue,
  lowStock,
}: Props) {
  const stats = [
    ["Total Produk", products.length, Package],

    [
      "Total Stok",
      products.reduce(
        (sum, p) => sum + p.stock,
        0
      ),
      Boxes,
    ],

    [
      "Nilai Persediaan",
      formatCurrency(inventoryValue),
      Activity,
    ],

    [
      "Stok Menipis",
      lowStock.length,
      AlertTriangle,
    ],
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(([label, value, Icon]) => (
        <Card key={label}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                {label}
              </p>

              <strong className="text-3xl">
                {value}
              </strong>
            </div>

            <Icon className="text-amber-700 dark:text-amber-400" />
          </div>
        </Card>
      ))}
    </div>
  );
}