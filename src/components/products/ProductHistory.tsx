import type { Transaction } from "../../types";
import { formatDate } from "../../utils/format";

interface ProductHistoryProps {
  history: Transaction[];
}

export default function ProductHistory({
  history,
}: ProductHistoryProps) {
  return (
    <div className="mt-6">

      <h3 className="mb-3 text-lg font-bold">
        Riwayat Transaksi
      </h3>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">

        {history.length === 0 ? (

          <div className="p-8 text-center text-slate-500">

            Belum ada transaksi untuk produk ini.

          </div>

        ) : (

          <table className="w-full">

            <thead className="bg-slate-100 dark:bg-slate-800">

              <tr>

                <th className="px-4 py-3 text-left">
                  Tanggal
                </th>

                <th className="px-4 py-3 text-center">
                  Jenis
                </th>

                <th className="px-4 py-3 text-center">
                  Size
                </th>

                <th className="px-4 py-3 text-center">
                  Qty
                </th>

                <th className="px-4 py-3 text-left">
                  Catatan
                </th>

              </tr>

            </thead>

            <tbody>

              {history.map((transaction) => (

                <tr
                  key={transaction.id}
                  className="border-t border-slate-200 dark:border-slate-700"
                >

                  <td className="px-4 py-3">
                    {formatDate(transaction.createdAt)}
                  </td>

                  <td className="px-4 py-3 text-center">

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        transaction.type === "IN"
                          ? "bg-green-100 text-green-700"
                          : transaction.type === "OUT"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >

                      {transaction.type === "IN"
                        ? "Masuk"
                        : transaction.type === "OUT"
                        ? "Keluar"
                        : "Penyesuaian"}

                    </span>

                  </td>

                  <td className="px-4 py-3 text-center">

                    {transaction.size ?? "-"}

                  </td>

                  <td className="px-4 py-3 text-center font-semibold">

                    {transaction.quantity}

                  </td>

                  <td className="px-4 py-3">

                    {transaction.note || "-"}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}