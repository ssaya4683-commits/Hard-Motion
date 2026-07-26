import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "../common/Card";
import { formatCurrency } from "../../utils/format";
import type {
  SalesChartPoint,
  StockCategoryPoint,
  TopSellingProduct,
} from "../../services/dashboardService";

const COLORS = ["#d97706", "#f59e0b", "#111827", "#64748b", "#f97316", "#84cc16"];

type Props = {
  salesLastSevenDays: SalesChartPoint[];
  topSelling: TopSellingProduct[];
  stockByCategory: StockCategoryPoint[];
};

export function DashboardAnalyticsCharts({
  salesLastSevenDays,
  topSelling,
  stockByCategory,
}: Props) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="xl:col-span-2">
        <h2 className="mb-4 text-xl font-black">Penjualan 7 Hari Terakhir</h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={salesLastSevenDays}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(value) => `${Number(value) / 1000}k`} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="sales" name="Penjualan" fill="#d97706" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h2 className="mb-4 text-xl font-black">Top 10 Produk Terlaris</h2>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={topSelling} layout="vertical" margin={{ left: 16, right: 24 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value, name) => [value, name === "quantity" ? "Terjual" : name]} />
            <Bar dataKey="quantity" name="Terjual" fill="#111827" radius={[0, 10, 10, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h2 className="mb-4 text-xl font-black">Distribusi Stok per Kategori</h2>
        <ResponsiveContainer width="100%" height={360}>
          <PieChart>
            <Pie
              data={stockByCategory}
              dataKey="stock"
              nameKey="category"
              innerRadius={70}
              outerRadius={120}
              paddingAngle={3}
              label={({ payload }) => `${payload?.category ?? "Kategori"}: ${payload?.stock ?? 0}`}
            >
              {stockByCategory.map((entry, index) => (
                <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
