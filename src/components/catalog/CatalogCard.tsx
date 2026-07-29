import { Link } from "react-router-dom";

import { Card } from "../common/Card";
import { createWhatsappLink } from "../../utils/whatsapp";

import type { CatalogProduct } from "../../services/inventoryService";

interface Props {
  product: CatalogProduct;
}

export default function CatalogCard({ product }: Props) {
  const stock = product.totalStock;
  const stockStatus =
    stock === 0
      ? {
          label: "Habis",
          className:
            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        }
      : stock <= 5
        ? {
            label: "Stok Menipis",
            className:
              "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
          }
        : {
            label: "Tersedia",
            className:
              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          };
  const whatsappLink = createWhatsappLink({
    phone: localStorage.getItem("storeWhatsapp") || "",
    productName: product.name,
    price: product.sellingPrice,
    sizes: product.sizes.map((size) => String(size.size)),
  });

  return (
    <Card className="group overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <Link to={`/catalog/${product.id}`} className="block">
        <div className="relative overflow-hidden">
          <img
            src={product.coverImage}
            alt={product.name}
            className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${stockStatus.className}`}
          >
            {stockStatus.label}
          </div>
        </div>

        <div className="space-y-4 p-5 pb-0">
          <div>
            <h2 className="text-xl font-bold">{product.name}</h2>
            {product.category && (
              <p className="mt-1 text-sm text-slate-500">
                {product.category}
              </p>
            )}

            <p className="mt-1 text-2xl font-black text-blue-600">
              Rp {product.sellingPrice.toLocaleString("id-ID")}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm text-slate-500">Ukuran</p>

            <div className="flex flex-wrap gap-2">
              {product.sizes.length > 0 ? (
                product.sizes.map((size) => (
                  <span
                    key={size.id ?? `${product.id}-${size.size}`}
                    className="rounded-lg bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800"
                  >
                    {size.size}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400">
                  Tidak ada ukuran
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-sm text-slate-500">Total Stok</span>

            <div className="text-right">
              <div
                className={`inline-block rounded-lg px-3 py-1 text-sm font-bold ${stockStatus.className}`}
              >
                {stockStatus.label}
              </div>

              <p className="mt-1 text-xs text-slate-500">{stock} Pasang</p>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-5 pt-4">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          🟢 Pesan via WhatsApp
        </a>
      </div>
    </Card>
  );
}
