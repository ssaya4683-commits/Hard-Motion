import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "../common/Card";
type WeeklyTransaction = {
  label: string;
  IN: number;
  OUT: number;
};

type Props = {
  weeklyTransactions: WeeklyTransaction[];
};

export function WeeklyTransactionChart({
  weeklyTransactions,
}: Props) {

  return (
    <Card className="xl:col-span-2">
      <h2 className="mb-4 text-xl font-bold">
        Aktivitas Transaksi 7 Hari Terakhir
      </h2>

      <ResponsiveContainer
        width="100%"
        height={320}
      >
        <BarChart
          data={weeklyTransactions}
        >
          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis dataKey="label" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="IN"
            name="Barang Masuk"
            fill="#22c55e"
            radius={[6, 6, 0, 0]}
            barSize={24}
          />

          <Bar
            dataKey="OUT"
            name="Barang Keluar"
            fill="#ef4444"
            radius={[6, 6, 0, 0]}
            barSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}