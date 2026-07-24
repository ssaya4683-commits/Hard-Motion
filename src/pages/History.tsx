import {
  useMemo,
  useState,
} from "react";

import { Card } from "../components/common/Card";
import { AppLayout } from "../layouts/AppLayout";
import { useInventory } from "../hooks/useInventory";
import { formatDate } from "../utils/format";
export function History() {
  const {
    transactions,
    products,
  } = useInventory();

  const [
    productFilter,
    setProductFilter,
  ] = useState("");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState("");

  const [
    sizeFilter,
    setSizeFilter,
  ] = useState("");

  const filteredTransactions =
    useMemo(() => {
      return transactions.filter(
        (transaction) => {
          if (
            productFilter &&
            String(
              transaction.productId
            ) !== productFilter
          ) {
            return false;
          }

          if (
            typeFilter &&
            transaction.type !==
              typeFilter
          ) {
            return false;
          }

          if (
            sizeFilter &&
            String(
              transaction.size ?? ""
            ) !== sizeFilter
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      transactions,
      productFilter,
      typeFilter,
      sizeFilter,
    ]);

  return (
    <AppLayout>
      <Card>
        <h1 className="mb-6 text-3xl font-black">
          Riwayat Transaksi
        </h1>
                <div className="mb-6 grid gap-4 md:grid-cols-3">
          <select
            value={productFilter}
            onChange={(e) =>
              setProductFilter(
                e.target.value
              )
            }
            className="rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="">
              Semua Produk
            </option>

            {products.map(
              (product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name}
                </option>
              )
            )}
          </select>

          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(
                e.target.value
              )
            }
            className="rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="">
              Semua Transaksi
            </option>

            <option value="IN">
              Barang Masuk
            </option>

            <option value="OUT">
              Barang Keluar
            </option>
          </select>

          <select
            value={sizeFilter}
            onChange={(e) =>
              setSizeFilter(
                e.target.value
              )
            }
            className="rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="">
              Semua Ukuran
            </option>

            {Array.from(
              { length: 11 },
              (_, i) => i + 35
            ).map((size) => (
              <option
                key={size}
                value={size}
              >
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800">
                <th className="py-3">
                  Tanggal
                </th>

                <th>Produk</th>

                <th>Ukuran</th>

                <th>Tipe</th>

                <th>Qty</th>

                <th>Catatan</th>
              </tr>
            </thead>

            <tbody>
                          {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-slate-500"
                  >
                    Belum ada transaksi yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-t border-slate-200 dark:border-slate-800"
                  >
                    <td className="py-3">
                      {formatDate(transaction.createdAt)}
                    </td>

                    <td>
                      {transaction.productName}
                    </td>

                    <td>
                      {transaction.size ?? "-"}
                    </td>

                    <td>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          transaction.type === "IN"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {transaction.type === "IN"
                          ? "Masuk"
                          : "Keluar"}
                      </span>
                    </td>

                    <td className="font-semibold">
                      {transaction.quantity}
                    </td>

                    <td>
                      {transaction.note || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
}