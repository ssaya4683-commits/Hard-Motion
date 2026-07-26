import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import type { Product } from "../types";

const EXPORT_HEADERS = [
  "Kode",
  "Nama",
  "Kategori",
  "Ukuran",
  "Warna",
  "Harga Beli",
  "Harga Jual",
  "Stok",
  "Stok Minimum",
  "Rak",
  "Tanggal Dibuat",
] as const;

type ExportRow = (string | number)[];

export function exportProductsToExcel(products: Product[]) {
  const rows = products.map((product) => productToExportRow(product));
  const sheetRows = [[...EXPORT_HEADERS], ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);

  applyHeaderStyle(worksheet);
  worksheet["!cols"] = buildColumnWidths(sheetRows);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Produk");

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `HardMotion_Produk_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}

function productToExportRow(product: Product): ExportRow {
  const productWithOptionalFields = product as Product & {
    rak?: string;
    rack?: string;
  };

  return [
    product.sku,
    product.name,
    product.category,
    product.size,
    product.color,
    Number(product.purchasePrice ?? 0),
    Number(product.sellingPrice ?? 0),
    Number(product.stock ?? 0),
    Number(product.minimumStock ?? 0),
    productWithOptionalFields.rak ?? productWithOptionalFields.rack ?? "",
    formatDate(product.createdAt),
  ];
}

function applyHeaderStyle(worksheet: XLSX.WorkSheet) {
  EXPORT_HEADERS.forEach((_, index) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
    const cell = worksheet[cellAddress];

    if (cell) {
      cell.s = {
        font: { bold: true },
      };
    }
  });
}

function buildColumnWidths(rows: readonly (readonly (string | number)[])[]) {
  return EXPORT_HEADERS.map((_, columnIndex) => {
    const maxLength = rows.reduce((max, row) => {
      const value = row[columnIndex] ?? "";
      return Math.max(max, String(value).length);
    }, 0);

    return { wch: Math.min(Math.max(maxLength + 2, 12), 32) };
  });
}

function formatDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toISOString().slice(0, 10);
}
