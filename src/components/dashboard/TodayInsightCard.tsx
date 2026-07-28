import { Card } from "../common/Card";
import { formatCurrency } from "../../utils/format";
import type { TodayInsight } from "../../services/dashboardService";

type Props = {
  insight: TodayInsight;
};

export function TodayInsightCard({
  insight,
}: Props) {
  return (
    <Card>
      <h2 className="text-lg font-bold">
        📊 Insight Hari Ini
      </h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">

        <div>
          <p className="text-sm text-slate-500">
            Penjualan
          </p>

          <p className="text-2xl font-black">
            {formatCurrency(insight.sales)}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Transaksi
          </p>

          <p className="text-2xl font-black">
            {insight.transactions}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Item Terjual
          </p>

          <p className="text-2xl font-black">
            {insight.itemsSold}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Rata-rata
          </p>

          <p className="text-2xl font-black">
            {formatCurrency(
              insight.averageTransaction
            )}
          </p>
        </div>

      </div>
    </Card>
  );
}