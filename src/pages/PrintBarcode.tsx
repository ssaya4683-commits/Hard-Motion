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
        <p className="text-lg font-semibold">
          Memuat data produk...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold">
          Produk tidak ditemukan.
        </p>

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
    <div className="flex min-h-screen items-center justify-center bg-white p-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-300 p-8 shadow-lg print:border-0 print:shadow-none">
        <h1 className="text-center text-2xl font-black">
          HARD MOTION
        </h1>

        <p className="mt-6 text-center text-xl font-bold">
          {product.name}
        </p>

        <p className="mt-2 text-center text-slate-500">
          SKU : {product.sku}
        </p>

        <p className="mt-2 text-center text-2xl font-bold">
          Rp {product.sellingPrice.toLocaleString("id-ID")}
        </p>

        <div className="mt-8 flex justify-center">
          <Barcode value={product.barcode || ""} />
        </div>

        <p className="mt-4 text-center font-mono text-lg">
          {product.barcode}
        </p>

        <div className="mt-8 flex justify-center gap-3 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700"
          >
            🖨 Print
          </button>

          <Link
            to={`/catalog/${product.id}`}
            className="rounded-xl bg-slate-900 px-5 py-2 font-semibold text-white hover:bg-slate-700"
          >
            ← Kembali
          </Link>
        </div>
      </div>
    </div>
  );
}