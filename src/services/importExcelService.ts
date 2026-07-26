import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { db } from "../db/db";
import type { Product, ProductSize } from "../types";

export const IMPORT_COLUMNS = [
  "Kode",
  "Nama",
  "Kategori",
  "Ukuran",
  "Warna",
  "Harga Beli",
  "Harga Jual",
  "Stok",
  "Stok Minimum",
] as const;

export type DuplicateMode = "skip" | "update";

export interface ImportPreviewRow {
  rowNumber: number;
  kode: string;
  nama: string;
  kategori: string;
  ukuran: string;
  warna: string;
  hargaBeli: string;
  hargaJual: string;
  stok: string;
  stokMinimum: string;
  errors: string[];
  existingProduct?: Product;
}

export interface ImportResult {
  success: number;
  updated: number;
  failed: number;
}

const normalize = (value: unknown) =>
  String(value ?? "").trim();

const toNumber = (value: string) =>
  Number(value.replace(/,/g, ""));

const now = () => new Date().toISOString();

export async function readProductImportFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!extension || !["xlsx", "xls"].includes(extension)) {
    throw new Error("File harus berformat .xlsx atau .xls.");
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("File Excel tidak memiliki sheet.");
  }

  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
  });

  const products = await db.products.toArray();
  const existingBySku = new Map(
    products.map((product) => [product.sku.trim().toLowerCase(), product])
  );
  const seen = new Map<string, number>();

  return rows.map((row, index): ImportPreviewRow => {
    const preview: ImportPreviewRow = {
      rowNumber: index + 2,
      kode: normalize(row.Kode),
      nama: normalize(row.Nama),
      kategori: normalize(row.Kategori),
      ukuran: normalize(row.Ukuran),
      warna: normalize(row.Warna),
      hargaBeli: normalize(row["Harga Beli"]),
      hargaJual: normalize(row["Harga Jual"]),
      stok: normalize(row.Stok),
      stokMinimum: normalize(row["Stok Minimum"]),
      errors: [],
    };

    const key = preview.kode.toLowerCase();
    const hargaBeli = toNumber(preview.hargaBeli);
    const hargaJual = toNumber(preview.hargaJual);
    const stok = toNumber(preview.stok);
    const stokMinimum = toNumber(preview.stokMinimum);

    IMPORT_COLUMNS.forEach((column) => {
      if (!(column in row)) {
        preview.errors.push(`Kolom ${column} wajib ada.`);
      }
    });

    if (!preview.kode) preview.errors.push("Kode kosong.");
    if (!preview.nama) preview.errors.push("Nama kosong.");
    if (preview.hargaBeli === "" || Number.isNaN(hargaBeli)) {
      preview.errors.push("Harga Beli bukan angka.");
    }
    if (preview.hargaJual === "" || Number.isNaN(hargaJual)) {
      preview.errors.push("Harga Jual bukan angka.");
    }
    if (preview.stok === "" || Number.isNaN(stok)) {
      preview.errors.push("Stok bukan angka.");
    } else if (stok < 0) {
      preview.errors.push("Stok negatif.");
    }
    if (preview.stokMinimum === "" || Number.isNaN(stokMinimum)) {
      preview.errors.push("Stok Minimum bukan angka.");
    }

    if (key) {
      const firstRow = seen.get(key);
      if (firstRow) {
        preview.errors.push(`Kode duplikat di file (baris ${firstRow}).`);
      } else {
        seen.set(key, preview.rowNumber);
      }

      const existing = existingBySku.get(key);
      if (existing) {
        preview.existingProduct = existing;
        preview.errors.push("Kode sudah ada di database.");
      }
    }

    return preview;
  });
}

export async function importPreviewRows(
  rows: ImportPreviewRow[],
  mode: DuplicateMode,
  onProgress: (progress: number) => void
): Promise<ImportResult> {
  const result: ImportResult = { success: 0, updated: 0, failed: 0 };
  const validRows = rows.filter(
    (row) =>
      !row.errors.some((error) => !error.includes("sudah ada di database"))
  );

  for (const [index, row] of validRows.entries()) {
    const existing = row.existingProduct;

    if (existing && mode === "skip") {
      result.failed += 1;
      onProgress(Math.round(((index + 1) / validRows.length) * 100));
      continue;
    }

    const payload = {
      sku: row.kode,
      barcode: existing?.barcode ?? row.kode,
      name: row.nama,
      category: row.kategori,
      brand: existing?.brand ?? "",
      purchasePrice: toNumber(row.hargaBeli),
      sellingPrice: toNumber(row.hargaJual),
      stock: toNumber(row.stok),
      minimumStock: toNumber(row.stokMinimum),
      size: row.ukuran,
      color: row.warna,
      image: existing?.image ?? "",
      description: existing?.description ?? "",
      updatedAt: now(),
    };

    try {
      await db.transaction("rw", db.products, db.productSizes, async () => {
        const productId = existing?.id
          ? (await db.products.update(existing.id, payload), existing.id)
          : Number(await db.products.add({ ...payload, createdAt: now() }));

        await db.productSizes.where("productId").equals(productId).delete();
        await db.productSizes.add({
          productId,
          size: toNumber(row.ukuran),
          stock: toNumber(row.stok),
          createdAt: now(),
        } satisfies Omit<ProductSize, "id">);
      });

      if (existing) result.updated += 1;
      else result.success += 1;
    } catch (error) {
      console.error("IMPORT PRODUCT ERROR", error);
      result.failed += 1;
    }

    onProgress(Math.round(((index + 1) / validRows.length) * 100));
    await new Promise((resolve) => window.setTimeout(resolve));
  }

  if (!validRows.length) onProgress(0);
  return result;
}

export function downloadProductImportTemplate() {
  const worksheet = XLSX.utils.json_to_sheet([
    {
      Kode: "HM-001",
      Nama: "Hard Motion Tee",
      Kategori: "T-Shirt",
      Ukuran: 42,
      Warna: "Black",
      "Harga Beli": 75000,
      "Harga Jual": 150000,
      Stok: 10,
      "Stok Minimum": 2,
    },
  ]);

  worksheet["!cols"] = IMPORT_COLUMNS.map(() => ({ wch: 18 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template Produk");

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    "HardMotion-Template-Import-Produk.xlsx"
  );
}
