import { useMemo, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { useInventory } from "../hooks/useInventory";
import { exportProductsToExcel } from "../services/excelService";
import { getStockStatus } from "../services/inventoryService";

import type { Product } from "../types";

type ExportFilter = "all" | "category" | "out" | "low" | "date-range";

const inputClass =
  "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950";

export function ExportProducts() {
  const { products } = useInventory();
  const [filter, setFilter] = useState<ExportFilter>("all");
  const [category, setCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))],
    [products]
  );

  const exportProducts = useMemo(() => {
    return products.filter((product) => {
      if (filter === "category") {
        return category === "all" || product.category === category;
      }

      if (filter === "out") {
        return getStockStatus(product) === "out";
      }

      if (filter === "low") {
        return getStockStatus(product) === "low";
      }

      if (filter === "date-range") {
        const createdAt = getProductCreatedDate(product);
        const start = startDate ? new Date(`${startDate}T00:00:00`).getTime() : undefined;
        const end = endDate ? new Date(`${endDate}T23:59:59`).getTime() : undefined;

        if (!createdAt) return false;
        if (start && createdAt < start) return false;
        if (end && createdAt > end) return false;
      }

      return true;
    });
  }, [category, endDate, filter, products, startDate]);

  function handleExport() {
    if (filter === "category" && category === "all") {
      toast.error("Pilih kategori produk terlebih dahulu.");
      return;
    }

    if (filter === "date-range" && !startDate && !endDate) {
      toast.error("Isi tanggal mulai atau tanggal akhir terlebih dahulu.");
      return;
    }

    if (filter === "date-range" && startDate && endDate && startDate > endDate) {
      toast.error("Tanggal mulai tidak boleh lebih besar dari tanggal akhir.");
      return;
    }

    if (exportProducts.length === 0) {
      toast.error("Tidak ada produk yang sesuai dengan filter export.");
      return;
    }

    exportProductsToExcel(exportProducts);
    toast.success(`${exportProducts.length} produk berhasil diexport ke Excel.`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black">Export Produk</h1>
          <p className="text-slate-500">Export data produk Hard Motion ke file Excel .xlsx.</p>
        </div>
      </div>

      <Card className="space-y-5 p-5">
        <div className="flex items-start gap-3 rounded-2xl border border-dashed border-slate-300 p-5 dark:border-slate-700">
          <FileSpreadsheet className="mt-1 text-emerald-600" size={36} />
          <div>
            <p className="font-semibold">Filter data sebelum export</p>
            <p className="text-sm text-slate-500">
              File akan dibuat dengan nama HardMotion_Produk_YYYY-MM-DD.xlsx.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2">
            <span className="text-sm font-medium">Filter Export</span>
            <select value={filter} onChange={(event) => setFilter(event.target.value as ExportFilter)} className={`${inputClass} w-full`}>
              <option value="all">Semua Produk</option>
              <option value="category">Per Kategori</option>
              <option value="out">Stok Habis</option>
              <option value="low">Stok Minimum</option>
              <option value="date-range">Rentang Tanggal</option>
            </select>
          </label>

          {filter === "category" && (
            <label className="space-y-2">
              <span className="text-sm font-medium">Kategori</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className={`${inputClass} w-full`}>
                <option value="all">Pilih Kategori</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          )}

          {filter === "date-range" && (
            <>
              <label className="space-y-2">
                <span className="text-sm font-medium">Tanggal Mulai</span>
                <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className={`${inputClass} w-full`} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Tanggal Akhir</span>
                <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className={`${inputClass} w-full`} />
              </label>
            </>
          )}
        </div>

        <div className="flex flex-col justify-between gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <span className="font-bold">{exportProducts.length}</span> dari {products.length} produk siap diexport.
          </p>
          <Button disabled={exportProducts.length === 0} onClick={handleExport}>
            <span className="inline-flex items-center gap-2"><Download size={18} /> Export</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}

function getProductCreatedDate(product: Product) {
  const value = product.createdAt;
  if (!value) return undefined;

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? undefined : time;
}
