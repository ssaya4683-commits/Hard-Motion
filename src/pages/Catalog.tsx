import CatalogGrid from "../components/catalog/CatalogGrid";
import CatalogFooter from "../components/catalog/CatalogFooter";

import { useInventory } from "../hooks/useInventory";

export default function Catalog() {
  const { products } = useInventory();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">

      <div className="mb-10 text-center">

        <h1 className="text-4xl font-bold">
          HARD MOTION
        </h1>

        <p className="mt-3 text-slate-500">
          Katalog Produk
        </p>

      </div>

      <CatalogGrid products={products} />

      <CatalogFooter />

    </div>
  );
}