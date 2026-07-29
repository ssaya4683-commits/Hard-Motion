import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Barcode } from "../components/barcode/Barcode";
import { inventoryService } from "../services/inventoryService";

import type { Product } from "../types";

export default function PrintBarcode() {
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        if (!id) {
          setLoading(false);
          return;
        }

        const data = await inventoryService.getProductById(Number(id));

        setProduct(data ?? null);
      } catch (error) {
        console.error("Failed to load product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    void loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold">Memuat data produk...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold">Produk tidak ditemukan.</p>

        <Link
          to="/catalog"
          className="rounded-xl bg-slate-900 px-5 py-2 font-semibold text-white"
        >
          ← Kembali ke Catalog
        </Link>
      </div>
    );
  }

  return (
    <main className="barcode-print-page min-h-screen bg-slate-100 p-6 text-slate-950 print:bg-white print:p-0">
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between gap-3 print:hidden">
        <Link
          to={`/catalog/${product.id}`}
          className="rounded-xl bg-white px-5 py-2 font-semibold text-slate-900 shadow hover:bg-slate-50"
        >
          ← Kembali
        </Link>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white shadow hover:bg-emerald-700"
        >
          🖨 Print / Save as PDF
        </button>
      </div>

      <section className="barcode-sheet mx-auto bg-white shadow-xl print:shadow-none">
        <div className="barcode-label">
          <p className="barcode-store">HARD MOTION</p>

          <p className="barcode-name">{product.name}</p>

          <p className="barcode-meta">SKU: {product.sku}</p>

          <p className="barcode-price">
            Rp {product.sellingPrice.toLocaleString("id-ID")}
          </p>

          <div className="barcode-symbol" aria-label={`Barcode ${product.barcode}`}>
            <Barcode value={product.barcode || product.sku} height={54} width={1.6} />
          </div>

          <p className="barcode-value">{product.barcode || product.sku}</p>
        </div>
      </section>
    </main>
  );
}
