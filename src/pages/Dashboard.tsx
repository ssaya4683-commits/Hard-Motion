import { Card } from "../components/common/Card";
import { useDashboard } from "../hooks/useDashboard";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { RecentTransactionsCard } from "../components/dashboard/RecentTransactionsCard";
import { DashboardAnalyticsCharts } from "../components/dashboard/DashboardAnalyticsCharts";
import type { DashboardPeriod } from "../services/dashboardService";
import { useNavigate } from "react-router-dom";
import { TodayInsightCard } from "../components/dashboard/TodayInsightCard";

const FILTERS: { label: string; value: DashboardPeriod }[] = [
  { label: "Hari ini", value: "today" },
  { label: "Minggu ini", value: "week" },
  { label: "Bulan ini", value: "month" },
  { label: "Semua", value: "all" },
];

export function Dashboard() {
  const navigate = useNavigate();
  const {
    products,
    inventoryValue,
    recentTransactions,
    today,
    todayInsight,
    lowStock,
    outOfStock,
    salesLastSevenDays,
    topSelling,
    stockByCategory,
    period,
    setPeriod,
    filteredTransactions,
  } = useDashboard();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-amber-900/10 md:flex-row md:items-center md:justify-between">
        <div>
  <p className="text-sm font-bold uppercase tracking-[0.35em] text-amber-400">
    Hard Motion Inventory
  </p>

  <h1 className="mt-2 text-4xl font-black">
    Selamat Datang 👋
  </h1>

  <p className="mt-2 max-w-2xl text-slate-300">
    Kelola stok, pantau penjualan, dan lihat performa toko dalam satu dashboard.
  </p>

  <p className="mt-5 text-sm text-slate-400">
    {new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })}
  </p>
</div>

        <div className="flex flex-wrap gap-2 rounded-2xl bg-white/10 p-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setPeriod(filter.value)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                period === filter.value
                  ? "bg-amber-500 text-slate-950"
                  : "text-slate-200 hover:bg-white/10"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  <Card className="cursor-pointer transition hover:-translate-y-1 hover:shadow-lg" onClick={() => navigate("/sales")}>
    <div className="text-3xl">🛒</div>
    <h3 className="mt-3 text-lg font-bold">Penjualan Baru</h3>
    <p className="mt-1 text-sm text-slate-500">
      Mulai transaksi penjualan.
    </p>
  </Card>

  <Card className="cursor-pointer transition hover:-translate-y-1 hover:shadow-lg" onClick={() => navigate("/products?new=1")}>
    <div className="text-3xl">📦</div>
    <h3 className="mt-3 text-lg font-bold">Tambah Produk</h3>
    <p className="mt-1 text-sm text-slate-500">
      Tambahkan produk baru ke inventaris.
    </p>
  </Card>

  <Card className="cursor-pointer transition hover:-translate-y-1 hover:shadow-lg" onClick={() => navigate("/catalog")}>
    <div className="text-3xl">👟</div>
    <h3 className="mt-3 text-lg font-bold">Katalog</h3>
    <p className="mt-1 text-sm text-slate-500">
      Lihat katalog pelanggan.
    </p>
  </Card>

  <Card className="cursor-pointer transition hover:-translate-y-1 hover:shadow-lg" onClick={() => navigate("/settings")}>
    <div className="text-3xl">💾</div>
    <h3 className="mt-3 text-lg font-bold">Backup</h3>
    <p className="mt-1 text-sm text-slate-500">
      Backup database Hard Motion.
    </p>
  </Card>
</div>

      <DashboardStats
        products={products}
        inventoryValue={inventoryValue}
        lowStock={lowStock}
        todaySales={today.sales}
        todayTransactions={today.transactions}
      />
      <TodayInsightCard
  insight={todayInsight}
/>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Status Inventaris
          </p>
          <h3 className="mt-2 text-2xl font-black">
            {lowStock.length === 0 ? "Aman" : "Perlu Restock"}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {lowStock.length} produk hampir habis dan {outOfStock.length} produk habis.
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Transaksi Filter Aktif
          </p>
          <h3 className="mt-2 text-3xl font-black">{filteredTransactions.length}</h3>
          <p className="mt-2 text-sm text-slate-500">
            Data ini digunakan untuk Top 10 Produk Terlaris.
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Kategori Aktif
          </p>
          <h3 className="mt-2 text-3xl font-black">{stockByCategory.length}</h3>
          <p className="mt-2 text-sm text-slate-500">
            Distribusi stok dihitung langsung dari tabel produk Dexie.
          </p>
        </Card>
      </div>

      <DashboardAnalyticsCharts
        salesLastSevenDays={salesLastSevenDays}
        topSelling={topSelling}
        stockByCategory={stockByCategory}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <RecentTransactionsCard recentTransactions={recentTransactions} />
      </div>
    </div>
  );
}
