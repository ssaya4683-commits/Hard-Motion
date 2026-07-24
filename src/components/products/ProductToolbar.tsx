import { Grid2x2, List, Plus, Search } from "lucide-react";

export type SortKey =
  | "createdAt"
  | "name"
  | "stock"
  | "purchasePrice"
  | "sellingPrice";

export type StockFilter =
  | "all"
  | "safe"
  | "low"
  | "out";

interface ProductToolbarProps {
  query: string;
  category: string;
  brand: string;
  stockStatus: StockFilter;
  sortKey: SortKey;
  pageSize: number;
  viewMode: "table" | "grid";

  categories: string[];
  brands: string[];

  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onStockStatusChange: (value: StockFilter) => void;
  onSortChange: (value: SortKey) => void;
  onPageSizeChange: (value: number) => void;
  onViewModeChange: (mode: "table" | "grid") => void;

  onAdd: () => void;
}

export function ProductToolbar({
  query,
  category,
  brand,
  stockStatus,
  sortKey,
  pageSize,
  viewMode,
  categories,
  brands,
  onQueryChange,
  onCategoryChange,
  onBrandChange,
  onStockStatusChange,
  onSortChange,
  onPageSizeChange,
  onViewModeChange,
  onAdd,
}: ProductToolbarProps) {
  const selectClass =
    "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-3 xl:grid-cols-12">
        {/* Search */}
        <div className="relative xl:col-span-4">
          <Search
            size={18}
            className="absolute left-3 top-2.5 text-slate-400"
          />

          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search name, SKU, barcode..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={selectClass}
        >
          <option value="all">All Categories</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Brand */}
        <select
          value={brand}
          onChange={(e) => onBrandChange(e.target.value)}
          className={selectClass}
        >
          <option value="all">All Brands</option>

          {brands.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Stock */}
        <select
          value={stockStatus}
          onChange={(e) =>
            onStockStatusChange(
              e.target.value as StockFilter
            )
          }
          className={selectClass}
        >
          <option value="all">All Status</option>
          <option value="safe">Safe</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>

        {/* Sort */}
        <select
          value={sortKey}
          onChange={(e) =>
            onSortChange(e.target.value as SortKey)
          }
          className={selectClass}
        >
          <option value="createdAt">Newest</option>
          <option value="name">Product Name</option>
          <option value="stock">Stock</option>
          <option value="purchasePrice">Purchase Price</option>
          <option value="sellingPrice">Selling Price</option>
        </select>

        {/* Page Size */}
        <select
          value={pageSize}
          onChange={(e) =>
            onPageSizeChange(Number(e.target.value))
          }
          className={selectClass}
        >
          {[10, 25, 50, 100].map((size) => (
            <option
              key={size}
              value={size}
            >
              {size} / page
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {/* View Mode */}
        <div className="flex overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700">
          <button
            onClick={() => onViewModeChange("table")}
            className={`flex items-center gap-2 px-4 py-2 text-sm ${
              viewMode === "table"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : ""
            }`}
          >
            <List size={18} />
            Table
          </button>

          <button
            onClick={() => onViewModeChange("grid")}
            className={`flex items-center gap-2 px-4 py-2 text-sm ${
              viewMode === "grid"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : ""
            }`}
          >
            <Grid2x2 size={18} />
            Grid
          </button>
        </div>

        {/* Add Button */}
        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-white transition hover:opacity-90 dark:bg-white dark:text-slate-900"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>
    </div>
  );
}