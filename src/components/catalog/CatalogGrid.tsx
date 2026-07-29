import CatalogCard from "./CatalogCard";

import type { CatalogProduct } from "../../services/inventoryService";

interface Props {
  products: CatalogProduct[];
}

export default function CatalogGrid({ products }: Props) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500">
        Belum ada produk.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <CatalogCard key={product.id} product={product} />
      ))}
    </div>
  );
}
