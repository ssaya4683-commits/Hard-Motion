import { Card } from "../components/common/Card";
import { useDashboard } from "../hooks/useDashboard";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { RecentTransactionsCard } from "../components/dashboard/RecentTransactionsCard";
import { WeeklyTransactionChart } from "../components/dashboard/WeeklyTransactionChart";

export function Dashboard() {
  const {
  products,
  inventoryValue,
  transactions,
  recentTransactions,
  today,
  lowStock,
  outOfStock,
  weeklyTransactions,
} = useDashboard();

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black">
            Dashboard
          </h1>

          <p className="text-slate-500">
            Ringkasan operasional Hard Motion hari ini.
          </p>
        </div>

       <DashboardStats
  products={products}
  inventoryValue={inventoryValue}
  lowStock={lowStock}
/>
        <div className="grid gap-4 lg:grid-cols-3">
  <Card>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">
          Status Inventaris
        </p>

        <h3 className="mt-2 text-xl font-bold">
          {lowStock.length === 0
            ? "Aman"
            : "Perlu Restock"}
        </h3>
      </div>

      <div
        className={`rounded-full px-4 py-2 text-sm font-semibold ${
          lowStock.length === 0
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
        }`}
      >
        {lowStock.length === 0
          ? "Normal"
          : `${lowStock.length} Produk`}
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

    <h3 className="mt-2 text-3xl font-black">
  {today.transactions}
</h3>

<p className="mt-2 text-sm text-slate-500">
  Transaksi yang terjadi hari ini.
</p>
  </Card>

  <Card>
    <p className="text-sm text-slate-500">
      Produk Aktif
    </p>

    <h3 className="mt-2 text-3xl font-black">
  {outOfStock.length}
</h3>

    <p className="mt-2 text-sm text-slate-500">
  Produk yang stoknya sudah habis.
</p>
  </Card>
</div>

        <div className="grid gap-6 xl:grid-cols-3">
  <WeeklyTransactionChart
  weeklyTransactions={weeklyTransactions}
/>

          <RecentTransactionsCard
  recentTransactions={recentTransactions}
/>
        </div>
      </div>
    </div>
  );
}