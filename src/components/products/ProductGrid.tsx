import { Copy, Eye, Pencil, Trash2 } from "lucide-react";
import type { Product } from "../../types";
import { getStockStatus } from "../../services/inventoryService";
import { formatCurrency } from "../../utils/format";

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

interface ProductGridProps {
  products: Product[];

  onView(product: Product): void;

  onEdit(product: Product): void;

  onDuplicate(product: Product): void;

  onDelete(product: Product): void;
}

export function ProductGrid({
  products,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => {
        const status = getStockStatus(product);

        return (
          <div
            key={product.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-56 w-full object-cover"
              />
            ) : (
              <div className="flex h-56 items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
                No Image
              </div>
            )}

            <div className="space-y-3 p-4">
              <div>
                <p className="text-xs text-slate-500">
                  {product.sku}
                </p>

                <h3 className="line-clamp-2 text-lg font-bold">
                  {product.name}
                </h3>
              </div>

              <p className="text-xl font-black">
                {formatCurrency(product.sellingPrice)}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-sm">
                  Stock : {product.stock}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${statusMeta[status][1]}`}
                >
                  {statusMeta[status][0]}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2">
                <button
                  onClick={() => onView(product)}
                  className="rounded-lg border p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                  title="Detail"
                >
                  <Eye size={18} className="mx-auto" />
                </button>

                <button
                  onClick={() => onEdit(product)}
                  className="rounded-lg border p-2 text-emerald-600 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                  title="Edit"
                >
                  <Pencil size={18} className="mx-auto" />
                </button>

                <button
                  onClick={() => onDuplicate(product)}
                  className="rounded-lg border p-2 text-blue-600 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                  title="Duplicate"
                >
                  <Copy size={18} className="mx-auto" />
                </button>

                <button
                  onClick={() => onDelete(product)}
                  className="rounded-lg border p-2 text-red-600 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                  title="Delete"
                >
                  <Trash2 size={18} className="mx-auto" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}