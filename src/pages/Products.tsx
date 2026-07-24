import { useMemo, useState } from "react";

import { AppLayout } from "../layouts/AppLayout";
import { Card } from "../components/common/Card";

import { ProductForm } from "./ProductForm";

import { ProductToolbar } from "../components/products/ProductToolbar";
import { ProductTable } from "../components/products/ProductTable";
import { ProductGrid } from "../components/products/ProductGrid";
import { ProductDetailModal } from "../components/products/ProductDetailModal";

import { useInventory } from "../hooks/useInventory";
import { getStockStatus } from "../services/inventoryService";

import type { Product } from "../types";

type SortKey =
  | "name"
  | "stock"
  | "sellingPrice"
  | "purchasePrice"
  | "createdAt";

type StockFilter =
  | "all"
  | "safe"
  | "low"
  | "out";

export function Products() {
  const {
    products,
    saveProduct,
    deleteProduct,
    duplicateProduct,
    isSkuDuplicate,
  } = useInventory();

  const [editing, setEditing] =
    useState<Product>();

  const [viewing, setViewing] =
    useState<Product>();

  const [showForm, setShowForm] =
    useState(false);

  const [query, setQuery] =
    useState("");

  const [category, setCategory] =
    useState("all");

  const [brand, setBrand] =
    useState("all");

  const [stockStatus, setStockStatus] =
    useState<StockFilter>("all");

  const [sortKey, setSortKey] =
    useState<SortKey>("createdAt");

  const [pageSize, setPageSize] =
    useState(10);

  const [page, setPage] =
    useState(1);

  const [viewMode, setViewMode] =
    useState<"table" | "grid">("table");

  const categories = useMemo(
    () =>
      [...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const brands = useMemo(
    () =>
      [...new Set(products.map((p) => p.brand).filter(Boolean))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    return products
      .filter(
        (product) =>
          (!q ||
            [
              product.name,
              product.sku,
              product.barcode,
              product.category,
              product.brand,
            ].some((v) => v?.toLowerCase().includes(q))) &&
          (category === "all" || product.category === category) &&
          (brand === "all" || product.brand === brand) &&
          (stockStatus === "all" ||
            getStockStatus(product) === stockStatus)
      )
      .sort((a, b) => {
        if (sortKey === "name") {
          return a.name.localeCompare(b.name);
        }

        if (sortKey === "createdAt") {
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        }

        return Number(b[sortKey]) - Number(a[sortKey]);
      });
  }, [
    products,
    query,
    category,
    brand,
    stockStatus,
    sortKey,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const pageProducts = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function openAdd() {
    setEditing(undefined);
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setShowForm(true);
  }

  async function remove(product: Product) {
    if (
      !product.id ||
      !confirm(`Delete ${product.name}?`)
    )
      return;

    await deleteProduct(product.id);
  }

  return (
    <AppLayout>
  <div className="space-y-6">

    <div className="flex flex-col justify-between gap-3 sm:flex-row">

      <div>
        <h1 className="text-3xl font-black">
          Products
        </h1>

        <p className="text-slate-500">
          Hard Motion Inventory
        </p>
      </div>

    </div>

    <ProductToolbar
      query={query}
      category={category}
      brand={brand}
      stockStatus={stockStatus}
      sortKey={sortKey}
      pageSize={pageSize}
      viewMode={viewMode}
      categories={categories}
      brands={brands}
      onQueryChange={(value) => {
        setQuery(value);
        setPage(1);
      }}
      onCategoryChange={(value) => {
        setCategory(value);
        setPage(1);
      }}
      onBrandChange={(value) => {
        setBrand(value);
        setPage(1);
      }}
      onStockStatusChange={(value) => {
        setStockStatus(value);
        setPage(1);
      }}
      onSortChange={setSortKey}
      onPageSizeChange={(value) => {
        setPageSize(value);
        setPage(1);
      }}
      onViewModeChange={setViewMode}
      onAdd={openAdd}
    />

    <Card className="overflow-hidden">

      {viewMode === "table" ? (

        <ProductTable
          products={pageProducts}
          onView={setViewing}
          onEdit={openEdit}
          onDuplicate={duplicateProduct}
          onDelete={remove}
        />

      ) : (

        <ProductGrid
          products={pageProducts}
          onView={setViewing}
          onEdit={openEdit}
          onDuplicate={duplicateProduct}
          onDelete={remove}
        />

      )}

      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 p-4 text-sm dark:border-slate-800 sm:flex-row">

        <span>
          Showing {pageProducts.length} of {filtered.length} products
        </span>

        <div className="flex items-center gap-2">

          <button
            disabled={currentPage === 1}
            onClick={() =>
              setPage((page) => page - 1)
            }
            className="rounded-lg border px-3 py-1 disabled:opacity-40 dark:border-slate-700"
          >
            Prev
          </button>

          <span>
            Page {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setPage((page) => page + 1)
            }
            className="rounded-lg border px-3 py-1 disabled:opacity-40 dark:border-slate-700"
          >
            Next
          </button>

        </div>

      </div>

    </Card>
          {showForm && (
        <ProductForm
          product={editing}
          isSkuDuplicate={isSkuDuplicate}
          onClose={() => {
            setShowForm(false);
            setEditing(undefined);
          }}
          onSave={async (product) => {
            await saveProduct(product);
            setShowForm(false);
            setEditing(undefined);
          }}
        />
      )}

      <ProductDetailModal
        product={viewing}
        onClose={() => setViewing(undefined)}
      />

    </div>
  </AppLayout>
  );
}