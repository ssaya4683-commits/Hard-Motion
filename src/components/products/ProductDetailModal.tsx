import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Barcode,
  Boxes,
  Package,
  Palette,
  Tag,
  X,
} from "lucide-react";

import { Card } from "../common/Card";

import { useInventory } from "../../hooks/useInventory";

import type {
  Product,
  ProductSize,
  Transaction,
} from "../../types";

import {
  formatCurrency,
  formatDate,
} from "../../utils/format";

interface ProductDetailModalProps {
  product?: Product;
  onClose(): void;
}

export function ProductDetailModal({
  product,
  onClose,
}: ProductDetailModalProps) {

  const {
    getSizes,
    transactions,
  } = useInventory();

  const [
    sizes,
    setSizes,
  ] = useState<ProductSize[]>([]);

  useEffect(() => {

    async function load() {

      if (!product?.id) return;

      const result =
        await getSizes(product.id);

      setSizes(result);

    }

    void load();

  }, [product, getSizes]);

  const totalStock = useMemo(
    () =>
      sizes.reduce(
        (sum, item) =>
          sum + item.stock,
        0
      ),
    [sizes]
  );

  const sortedSizes = useMemo(
    () =>
      [...sizes].sort(
        (a, b) =>
          a.size - b.size
      ),
    [sizes]
  );

  const history = useMemo(
    () =>
      transactions
        .filter(
          (
            transaction:
              Transaction
          ) =>
            transaction.productId ===
            product?.id
        )
        .sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        )
        .slice(0, 5),
    [transactions, product]
  );

  if (!product) {
    return null;
  }

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">

      <Card className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-slate-500">
              {product.sku}
            </p>

            <h2 className="text-2xl font-black">
              {product.name}
            </h2>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X />
          </button>

        </div>

        {product.image ? (

          <img
            src={product.image}
            alt={product.name}
            className="my-6 h-80 w-full rounded-2xl object-cover"
          />

        ) : (

          <div className="my-6 flex h-80 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">

            No Image

          </div>

        )}

        <div className="grid gap-4 md:grid-cols-2">

          <Info
            icon={<Barcode size={18} />}
            title="Barcode"
            value={product.barcode || "-"}
          />

          <Info
            icon={<Tag size={18} />}
            title="SKU"
            value={product.sku}
          />

          <Info
            icon={<Package size={18} />}
            title="Brand"
            value={product.brand || "-"}
          />

          <Info
            icon={<Package size={18} />}
            title="Category"
            value={product.category || "-"}
          />

          <Info
            icon={<Palette size={18} />}
            title="Color"
            value={product.color || "-"}
          />

          <Info
            icon={<Boxes size={18} />}
            title="Total Stock"
            value={`${totalStock} Pasang`}
          />
                    <Info
            title="Minimum Stock"
            value={product.minimumStock}
          />

          <Info
            title="Purchase Price"
            value={formatCurrency(
              product.purchasePrice
            )}
          />

          <Info
            title="Selling Price"
            value={formatCurrency(
              product.sellingPrice
            )}
          />

          <Info
            title="Created"
            value={formatDate(
              product.createdAt
            )}
          />

        </div>

        <div className="mt-6">

          <h3 className="mb-2 text-lg font-bold">
            Description
          </h3>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">

            {product.description || "-"}

          </div>

        </div>

        <div className="mt-6">

          <h3 className="mb-3 text-lg font-bold">

            Stok per Ukuran

          </h3>

          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">

            <table className="w-full">

              <thead className="bg-slate-100 dark:bg-slate-800">

                <tr>

                  <th className="px-4 py-3 text-left">
                    Ukuran
                  </th>

                  <th className="px-4 py-3 text-right">
                    Stok
                  </th>

                  <th className="px-4 py-3 text-right">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {sortedSizes.length === 0 ? (

                  <tr>

                    <td
                      colSpan={3}
                      className="py-8 text-center text-slate-500"
                    >

                      Belum ada ukuran.

                    </td>

                  </tr>

                ) : (

                  sortedSizes.map((item) => (

                    <tr
                      key={item.id ?? item.size}
                      className="border-t border-slate-200 dark:border-slate-700"
                    >

                      <td className="px-4 py-3 font-semibold">

                        {item.size}

                      </td>

                      <td className="px-4 py-3 text-right">

                        {item.stock}

                      </td>

                      <td className="px-4 py-3 text-right">

                        <StockBadge
                          stock={item.stock}
                          minimum={product.minimumStock}
                        />

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>
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

                        {formatDate(
                          transaction.createdAt
                        )}

                      </td>

                      <td className="px-4 py-3 text-center">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            transaction.type === "IN"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : transaction.type === "OUT"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
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

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">

          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Cetak Barcode
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
          >
            Tutup
          </button>

        </div>

      </Card>

    </div>
  );
}
  interface InfoProps {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

function Info({
  title,
  value,
  icon,
}: InfoProps) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">

      <div className="flex items-center gap-2 text-slate-500">

        {icon}

        <span className="text-xs font-medium uppercase tracking-wide">

          {title}

        </span>

      </div>

      <div className="mt-2 text-base font-semibold break-words">

        {value}

      </div>

    </div>
  );
}

interface StockBadgeProps {
  stock: number;
  minimum: number;
}

function StockBadge({
  stock,
  minimum,
}: StockBadgeProps) {

  if (stock <= 0) {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
        Habis
      </span>
    );
  }

  if (stock <= minimum) {
    return (
      <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
        Menipis
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
      Aman
    </span>
  );
}
