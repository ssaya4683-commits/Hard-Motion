import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useInventory } from "../hooks/useInventory";
import { Barcode } from "../components/barcode/Barcode";

export default function ProductDetail() {
  const { id } = useParams();

  const {
  getProduct,
  getSizes,
  getTotalStock,
} = useInventory();

  const product = getProduct(Number(id));
  const [sizes, setSizes] = useState<number[]>([]);
const [totalStock, setTotalStock] = useState(product?.stock ?? 0);
useEffect(() => {
  if (!product?.id) return;

  const productId = product.id;

  async function load() {
    const sizeList = await getSizes(productId);
    const stock = await getTotalStock(productId);

    setSizes(sizeList.map((item) => item.size));
    setTotalStock(stock);
  }

  void load();
}, [product?.id, getSizes, getTotalStock]);

  if (!product) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <h1 className="text-2xl font-bold">
          Produk tidak ditemukan
        </h1>

        <Link
          to="/catalog"
          className="mt-6 inline-block text-blue-600 hover:underline"
        >
          ← Kembali ke katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-8">

      <Link
        to="/catalog"
        className="mb-6 inline-block text-blue-600 hover:underline"
      >
        ← Kembali
      </Link>

      <div className="grid gap-10 md:grid-cols-2">

        <img
          src={product.image || "/no-image.png"}
          alt={product.name}
          className="aspect-square w-full rounded-2xl object-cover shadow-lg"
        />

        <div>

          <h1 className="text-4xl font-bold">
            {product.name}
          </h1>

          {product.category && (
            <p className="mt-2 text-slate-500">
              {product.category}
            </p>
          )}

          <p className="mt-6 text-4xl font-black text-blue-600">
            Rp{" "}
            {product.sellingPrice.toLocaleString("id-ID")}
          </p>

          <div className="mt-8 space-y-3">

            <div className="flex justify-between border-b pb-2">
              <span>SKU</span>
              <span>{product.sku}</span>
            </div>
            <div className="mt-8 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
  <h3 className="mb-4 text-lg font-bold">
    Barcode
  </h3>

  <Barcode value={product.barcode} />

  <button
    type="button"
    onClick={() =>
      navigator.clipboard.writeText(product.barcode)
    }
    className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700 dark:bg-white dark:text-black"
  >
    📋 Copy Barcode
  </button>
  <Link
  to={`/catalog/${product.id}/print-barcode`}
  className="rounded-xl bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700"
>
  🖨 Print Barcode
</Link>
</div>

            <div className="flex justify-between border-b pb-2">
              <span>Total Stok</span>
              <span>{totalStock} Pasang</span>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span>Minimum Stok</span>
              <span>{product.minimumStock}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
  <span>Ukuran</span>

  <span>
    {sizes.length > 0
      ? sizes.join(", ")
      : "-"}
  </span>
</div>
{product.description && (
  <div className="mt-8">
    <h2 className="mb-2 text-lg font-semibold">
      Deskripsi
    </h2>

    <p className="leading-7 text-slate-600 dark:text-slate-300">
      {product.description}
    </p>
  </div>
)}


          </div>

        </div>

      </div>

    </div>
    
  );
}