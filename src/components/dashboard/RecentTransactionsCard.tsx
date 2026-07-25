import { Card } from "../common/Card";
import { formatDate } from "../../utils/format";
import type { Transaction } from "../../types";

type Props = {
  recentTransactions: Transaction[];
};

export function RecentTransactionsCard({
  recentTransactions,
}: Props) {

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Aktivitas Terbaru
        </h2>

        <span className="text-sm text-slate-500">
          {recentTransactions.length} transaksi
        </span>
      </div>

      <div className="space-y-3">
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-slate-500">
            Belum ada transaksi.
          </p>
        ) : (
          recentTransactions.map((transaction) => (
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
                  {formatDate(transaction.createdAt)}
                </span>
              </div>

              <p className="font-semibold">
                {transaction.productName}
              </p>

              <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                <span>
                  Ukuran <strong>{transaction.size ?? "-"}</strong>
                </span>

                <span>
                  Qty <strong>{transaction.quantity}</strong>
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
  );
}