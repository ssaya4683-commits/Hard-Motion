import ProductBarcode from "../barcode/ProductBarcode";
import { generateBarcodeValue } from "../../utils/barcode";

import type {
  Product,
  ProductSize,
} from "../../types";

interface ProductSizeTableProps {
  product: Product;
  sizes: ProductSize[];
}

export default function ProductSizeTable({
  product,
  sizes,
}: ProductSizeTableProps) {
  const sortedSizes = [...sizes].sort(
    (a, b) => a.size - b.size
  );

  return (
    <div className="mt-6">

      <h3 className="mb-3 text-lg font-bold">
        Stok per Ukuran
      </h3>

      {sortedSizes.length === 0 ? (

        <div className="rounded-xl border border-slate-200 p-8 text-center text-slate-500 dark:border-slate-700">

          Belum ada ukuran.

        </div>

      ) : (

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

          {sortedSizes.map((item) => (

            <div
              key={item.id ?? item.size}
              className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
            >

              <div className="flex items-center justify-between">

                <h4 className="text-lg font-bold">
                  Size {item.size}
                </h4>

                <StockBadge
                  stock={item.stock}
                  minimum={product.minimumStock}
                />

              </div>

              <div className="mt-4 flex justify-center">

                <ProductBarcode
                  value={generateBarcodeValue(
                    product.sku,
                    item.size
                  )}
                  width={2}
                  height={55}
                  displayValue
                />

              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">

                <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">

                  <div className="text-slate-500">
                    Stok
                  </div>

                  <div className="text-xl font-bold">
                    {item.stock}
                  </div>

                </div>

                <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">

                  <div className="text-slate-500">
                    Barcode
                  </div>

                  <div className="font-semibold">
                    {generateBarcodeValue(
                      product.sku,
                      item.size
                    )}
                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

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
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Habis
      </span>
    );
  }

  if (stock <= minimum) {
    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
        Menipis
      </span>
    );
  }

  return (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
      Aman
    </span>
  );
}