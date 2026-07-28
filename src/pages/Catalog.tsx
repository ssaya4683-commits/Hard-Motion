import { useMemo, useState } from "react";

import CatalogGrid from "../components/catalog/CatalogGrid";
import CatalogFooter from "../components/catalog/CatalogFooter";

import { useInventory } from "../hooks/useInventory";

export default function Catalog() {
  const { products } = useInventory();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState("newest");

  const filteredProducts = useMemo(() => {
    const keyword = query.toLowerCase().trim();

    if (!keyword) {
      return products;
    }

    return products.filter((product) =>
      [
        product.name,
        product.category,
        product.brand,
        product.sku,
      ]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(keyword)
        )
    );
  }, [products, query]);

  const categories = useMemo(() => {
    return [
      "Semua",
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ];
  }, [products]);

  const displayedProducts = useMemo(() => {
    if (category === "Semua") {
      return filteredProducts;
    }

    return filteredProducts.filter(
      (product) => product.category === category
    );
  }, [filteredProducts, category]);

  const sortedProducts = useMemo(() => {
    const list = [...displayedProducts];

    switch (sortBy) {
      case "name-asc":
        return list.sort((a, b) => a.name.localeCompare(b.name));

      case "name-desc":
        return list.sort((a, b) => b.name.localeCompare(a.name));

      case "stock":
        return list.sort((a, b) => b.stock - a.stock);

      default:
        return list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
    }
  }, [displayedProducts, sortBy]);

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

      <div className="mb-8">
        <input
          type="search"
          placeholder="🔍 Cari produk..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-5 py-3 shadow-sm focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div className="mb-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="newest">Terbaru</option>
          <option value="name-asc">Nama A–Z</option>
          <option value="name-desc">Nama Z–A</option>
          <option value="stock">Stok Terbanyak</option>
        </select>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              category === item
                ? "bg-amber-500 text-white"
                : "border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <CatalogGrid products={sortedProducts} />

      <CatalogFooter />
    </div>
  );
}