import { useState } from "react";
import { Link } from "react-router-dom";

import { BarcodeScanner } from "../components/barcode/BarcodeScanner";
import { Card } from "../components/common/Card";
import { formatCurrency } from "../utils/format";
import type { Product } from "../types";

export function BarcodeScannerPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [barcode, setBarcode] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Barcode Scanner</h1>
        <p className="text-slate-500">
          Scan barcode CODE128 dari label produk Hard Motion.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <BarcodeScanner
            onBarcodeScanned={setBarcode}
            onProductFound={(nextProduct, scannedBarcode) => {
              setProduct(nextProduct);
              setBarcode(scannedBarcode);
            }}
          />
        </Card>

        <Card>
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Scan Result</h2>

            {barcode && (
              <p className="text-sm text-slate-500">
                Last barcode: <span className="font-semibold">{barcode}</span>
              </p>
            )}

            {product ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-black">{product.name}</h3>
                  <p className="text-sm text-slate-500">
                    {product.sku} • {product.brand || "No brand"}
                  </p>
                </div>

                <dl className="grid gap-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Barcode</dt>
                    <dd className="font-semibold">{product.barcode}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Price</dt>
                    <dd className="font-semibold">{formatCurrency(product.sellingPrice)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Stock</dt>
                    <dd className="font-semibold">{product.stock}</dd>
                  </div>
                </dl>

                {product.id && (
                  <Link
                    to={`/catalog/${product.id}`}
                    className="inline-flex rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white dark:bg-white dark:text-slate-900"
                  >
                    View Product
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Produk yang berhasil ditemukan akan tampil di sini.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
