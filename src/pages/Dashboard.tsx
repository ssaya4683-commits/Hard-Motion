import {
  Activity,
  AlertTriangle,
  Boxes,
  Package,
  TrendingDown,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "../components/common/Card";
import { AppLayout } from "../layouts/AppLayout";
import { useInventory } from "../hooks/useInventory";
import { formatCurrency, formatDate } from "../utils/format";

export function Dashboard() {
  const { products, transactions, summary } = useInventory();
  const lowStockProducts = products
  .filter(
    (product) =>
      product.stock <=
      product.minimumStock
  )
  .sort(
    (a, b) =>
      a.stock - b.stock
  )
  .slice(0, 5);

const latestTransactions =
  [...transactions]
    .sort(
      (a, b) =>
        new Date(
          b.createdAt
        ).getTime() -
        new Date(
          a.createdAt
        ).getTime()
    )
    .slice(0, 5);

  const stats = [
    ["Total Produk", summary.totalProducts, Package],
    ["Total Stok", summary.totalStock, Boxes],
    ["Nilai Persediaan", formatCurrency(summary.inventoryValue), Activity],
    ["Stok Menipis", summary.lowStock, AlertTriangle],
  ] as const;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black">
            Dashboard
          </h1>

          <p className="text-slate-500">
            Ringkasan operasional Hard Motion hari ini.
          </p>
        </div>

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
        <div className="grid gap-4 lg:grid-cols-3">
  <Card>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">
          Status Inventaris
        </p>

        <h3 className="mt-2 text-xl font-bold">
          {summary.lowStock === 0
            ? "Aman"
            : "Perlu Restock"}
        </h3>
      </div>

      <div
        className={`rounded-full px-4 py-2 text-sm font-semibold ${
          summary.lowStock === 0
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
        }`}
      >
        {summary.lowStock === 0
          ? "Normal"
          : `${summary.lowStock} Produk`}
      </div>
    </div>
  </Card>

  <Card>
    <p className="text-sm text-slate-500">
      Total Transaksi
    </p>

    <h3 className="mt-2 text-3xl font-black">
      {transactions.length}
    </h3>

    <p className="mt-2 text-sm text-slate-500">
      Seluruh riwayat transaksi
      yang telah tercatat.
    </p>
  </Card>

  <Card>
    <p className="text-sm text-slate-500">
      Produk Aktif
    </p>

    <h3 className="mt-2 text-3xl font-black">
      {products.filter(
        (product) => product.stock > 0
      ).length}
    </h3>

    <p className="mt-2 text-sm text-slate-500">
      Produk yang masih memiliki
      stok tersedia.
    </p>
  </Card>
</div>

        <div className="grid gap-6 xl:grid-cols-3">
  <Card className="xl:col-span-2">
    <h2 className="mb-4 text-xl font-bold">
      Grafik Stok Produk
    </h2>

    <ResponsiveContainer
      width="100%"
      height={320}
    >
      <BarChart data={products}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="name" />

        <YAxis />

        <Tooltip />

        <Bar
          dataKey="stock"
          fill="#8B5E3C"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>

    <div className="mt-8">
      <div className="mb-4 flex items-center gap-2">
        <TrendingDown
          size={20}
          className="text-amber-600"
        />

        <h3 className="text-lg font-bold">
          Produk Perlu Restock
        </h3>
      </div>

      {lowStockProducts.length === 0 ? (
        <p className="text-sm text-slate-500">
          Semua stok masih aman.
        </p>
      ) : (
        <div className="space-y-3">
          {lowStockProducts.map(
            (product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-700"
              >
                <div>
                  <p className="font-semibold">
                    {product.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    SKU: {product.sku}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-red-600">
                    {product.stock}
                  </p>

                  <p className="text-xs text-slate-500">
                    Minimum{" "}
                    {product.minimumStock}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  </Card>

          <Card>
  <div className="mb-4 flex items-center justify-between">
    <h2 className="text-xl font-bold">
      Aktivitas Terbaru
    </h2>

    <span className="text-sm text-slate-500">
      {latestTransactions.length} transaksi
    </span>
  </div>

  <div className="space-y-3">
    {latestTransactions.length === 0 ? (
      <p className="text-sm text-slate-500">
        Belum ada transaksi.
      </p>
    ) : (
      latestTransactions.map((transaction) => (
        <div
          key={transaction.id}
          className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
        >
          <div className="mb-2 flex items-center justify-between">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                transaction.type === "IN"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              }`}
            >
              {transaction.type === "IN"
                ? "Barang Masuk"
                : "Barang Keluar"}
            </span>

            <span className="text-xs text-slate-500">
              {formatDate(
                transaction.createdAt
              )}
            </span>
          </div>

          <p className="font-semibold">
            {transaction.productName}
          </p>

          <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
            <span>
              Ukuran{" "}
              <strong>
                {transaction.size ?? "-"}
              </strong>
            </span>

            <span>
              Qty{" "}
              <strong>
                {transaction.quantity}
              </strong>
            </span>
          </div>

          {transaction.note && (
            <p className="mt-2 text-sm text-slate-500">
              {transaction.note}
            </p>
          )}
        </div>
      ))
    )}
  </div>
</Card>
        </div>
      </div>
    </AppLayout>
  );
}