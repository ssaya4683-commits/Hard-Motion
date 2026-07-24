import { Pencil, Trash2 } from "lucide-react";
import type { Product } from "../../types";
import { formatCurrency } from "../../utils/format";
import { getStockStatus } from "../../services/inventoryService";

const statusMeta = {
  safe: [
    "Safe",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  ],
  low: [
    "Low Stock",
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  ],
  out: [
    "Out of Stock",
    "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  ],
} as const;

interface ProductTableProps {
  products: Product[];

  onView(product: Product): void;

  onEdit(product: Product): void;

  onDuplicate(product: Product): void;

  onDelete(product: Product): void;
}

export function ProductTable({
  products,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: ProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1300px] text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60">
            <th className="p-3">Image</th>
            <th>SKU</th>
            <th>Barcode</th>
            <th>Product</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Size</th>
            <th>Color</th>
            <th>Buy</th>
            <th>Sell</th>
            <th>Stock</th>
            <th>Min</th>
            <th>Status</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => {
            const status = getStockStatus(product);

            return (
              <tr
                key={product.id}
                className="border-t border-slate-200 dark:border-slate-800"
              >
                <td className="p-3">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400 dark:bg-slate-800">
                      No Image
                    </div>
                  )}
                </td>

                <td className="font-semibold">
                  {product.sku}
                </td>

                <td>
                  {product.barcode || "-"}
                </td>

                <td>
                  <button
                    onClick={() => onView(product)}
                    className="font-semibold text-emerald-600 hover:underline"
                  >
                    {product.name}
                  </button>

                  <p className="max-w-52 truncate text-xs text-slate-500">
                    {product.description}
                  </p>
                </td>

                <td>{product.category || "-"}</td>

                <td>{product.brand || "-"}</td>

                <td>{product.size || "-"}</td>

                <td>{product.color || "-"}</td>

                <td>
                  {formatCurrency(
                    product.purchasePrice
                  )}
                </td>

                <td className="font-semibold">
                  {formatCurrency(
                    product.sellingPrice
                  )}
                </td>

                <td>{product.stock}</td>

                <td>{product.minimumStock}</td>

                <td>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${statusMeta[status][1]}`}
                  >
                    {statusMeta[status][0]}
                  </span>
                </td>

                <td>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() =>
                        onView(product)
                      }
                    >
                      👁
                    </button>

                    <button
                      onClick={() =>
                        onEdit(product)
                      }
                      className="text-emerald-600"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() =>
                        onDuplicate(product)
                      }
                      className="text-blue-600"
                    >
                      ⧉
                    </button>

                    <button
                      onClick={() =>
                        onDelete(product)
                      }
                      className="text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {products.length === 0 && (
            <tr>
              <td
                colSpan={14}
                className="p-10 text-center text-slate-500"
              >
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}