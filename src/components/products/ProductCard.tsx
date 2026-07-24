import { Pencil } from "lucide-react";
import type { Product } from "../../types";
import { formatCurrency } from "../../utils/format";
import { Card } from "../common/Card";

type Props = {
  product: Product;
  onEdit: (p: Product) => void;
  onView: (p: Product) => void;
};

export function ProductCard({
  product,
  onEdit,
  onView,
}: Props) {
  return (
    <Card className="overflow-hidden transition hover:shadow-xl">
      <button
        onClick={() => onView(product)}
        className="block w-full"
      >
        {product.image ? (
          <img
            src={product.image}
            className="h-56 w-full object-cover"
            alt={product.name}
          />
        ) : (
          <div className="flex h-56 items-center justify-center bg-slate-100">
            Tidak ada foto
          </div>
        )}
      </button>

      <div className="space-y-2 p-4">
        <h3 className="font-bold">
          {product.name}
        </h3>

        <p className="text-sm text-slate-500">
          {product.sku}
        </p>

        <p className="text-xl font-black">
          {formatCurrency(product.sellingPrice)}
        </p>

        <div className="flex justify-between text-sm">
          <span>Stok</span>

          <strong>{product.stock}</strong>
        </div>

        <button
          onClick={() => onEdit(product)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-2 text-white"
        >
          <Pencil size={18} />
          Edit
        </button>
      </div>
    </Card>
  );
}