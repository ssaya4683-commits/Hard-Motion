import { useMemo, useState } from "react";
import { X, Printer, Package } from "lucide-react";

import { Card } from "../common/Card";
import ProductBarcode from "./ProductBarcode";
import { generateBarcodeValue } from "../../utils/barcode";

import type {
  Product,
  ProductSize,
} from "../../types";

interface PrintBarcodeModalProps {
  product: Product;
  sizes: ProductSize[];
  open: boolean;
  onClose(): void;
}

export default function PrintBarcodeModal({
  product,
  sizes,
  open,
  onClose,
}: PrintBarcodeModalProps) {

  const [selectedSize, setSelectedSize] =
    useState<number | "ALL">("ALL");

  const [copies, setCopies] =
    useState(1);

  const printableSizes = useMemo(() => {

    if (selectedSize === "ALL") {
      return sizes;
    }

    return sizes.filter(
      (item) => item.size === selectedSize
    );

  }, [sizes, selectedSize]);

  if (!open) {
    return null;
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

      <Card className="w-full max-w-5xl overflow-y-auto max-h-[90vh]">

        <div className="flex items-center justify-between border-b pb-4">

          <div>

            <h2 className="text-2xl font-bold">
              Cetak Barcode
            </h2>

            <p className="text-sm text-slate-500">
              {product.name}
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X />
          </button>

        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
                      <div className="space-y-6">

            <div>

              <label className="mb-2 block text-sm font-semibold">
                Pilih Ukuran
              </label>

              <select
                value={selectedSize}
                onChange={(e) =>
                  setSelectedSize(
                    e.target.value === "ALL"
                      ? "ALL"
                      : Number(e.target.value)
                  )
                }
                className="w-full rounded-lg border border-slate-300 p-3"
              >

                <option value="ALL">
                  Semua Ukuran
                </option>

                {sizes.map((item) => (

                  <option
                    key={item.size}
                    value={item.size}
                  >
                    Size {item.size}
                  </option>

                ))}

              </select>

            </div>

            <div>

              <label className="mb-2 block text-sm font-semibold">
                Jumlah Label
              </label>

              <input
                type="number"
                min={1}
                value={copies}
                onChange={(e) =>
                  setCopies(Number(e.target.value))
                }
                className="w-full rounded-lg border border-slate-300 p-3"
              />

            </div>

            <div className="rounded-xl border p-4">

              <div className="flex items-center gap-2">

                <Package size={18} />

                <span className="font-semibold">
                  Informasi Produk
                </span>

              </div>

              <div className="mt-4 space-y-2 text-sm">

                <div>
                  <strong>Nama :</strong> {product.name}
                </div>

                <div>
                  <strong>SKU :</strong> {product.sku}
                </div>

                <div>
                  <strong>Brand :</strong> {product.brand || "-"}
                </div>

              </div>

            </div>

          </div>

          <div className="lg:col-span-2">

            <h3 className="mb-4 text-lg font-bold">
              Preview Label
            </h3>

            <div className="grid gap-4 md:grid-cols-2">

              {printableSizes.map((item) => (

                <div
                  key={item.size}
                  className="rounded-xl border bg-white p-5"
                >

                  <div className="text-center">

                    <h4 className="text-lg font-black">
                      HARD MOTION
                    </h4>

                    <p className="text-sm text-slate-500">
                      {product.name}
                    </p>

                    <p className="mt-2 font-semibold">
                      Size {item.size}
                    </p>

                  </div>

                  <div className="my-4 flex justify-center">

                    <ProductBarcode
                      value={generateBarcodeValue(
                        product.sku,
                        item.size
                      )}
                      width={2}
                      height={60}
                      displayValue
                    />

                  </div>

                  <div className="text-center text-sm">

                    Rp{" "}
                    {product.sellingPrice.toLocaleString(
                      "id-ID"
                    )}

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>
                <div className="mt-8 flex items-center justify-between border-t pt-6">

          <div className="text-sm text-slate-500">

            Total Barcode :
            <span className="ml-2 font-semibold">
              {printableSizes.length * copies}
            </span>

          </div>

          <div className="flex gap-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-5 py-2 font-medium hover:bg-slate-100"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2 font-medium text-white hover:bg-slate-700"
            >
              <Printer size={18} />
              Cetak
            </button>

          </div>

        </div>

      </Card>

    </div>

  );

}