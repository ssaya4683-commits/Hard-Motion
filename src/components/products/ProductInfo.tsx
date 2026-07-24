import {
  Barcode,
  Boxes,
  Package,
  Palette,
  Tag,
} from "lucide-react";

import type { Product } from "../../types";
import {
  formatCurrency,
  formatDate,
} from "../../utils/format";

interface ProductInfoProps {
  product: Product;
  totalStock: number;
}

export default function ProductInfo({
  product,
  totalStock,
}: ProductInfoProps) {
  return (
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

      <div className="mt-2 break-words text-base font-semibold">
        {value}
      </div>

    </div>
  );
}