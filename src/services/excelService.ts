import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import type { Product } from "../types";

export function exportProductsToExcel(products: Product[]) {
  const rows = products.map((product) => ({
    SKU: product.sku,
    Barcode: product.barcode,
    Name: product.name,
    Category: product.category,
    Brand: product.brand,
    Color: product.color,
    Stock: product.stock,
    MinimumStock: product.minimumStock,
    PurchasePrice: product.purchasePrice,
    SellingPrice: product.sellingPrice,
    Description: product.description,
    CreatedAt: product.createdAt,
    Status:
      product.stock <= 0
        ? "Out of Stock"
        : product.stock <= product.minimumStock
        ? "Low Stock"
        : "Safe",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
  { wch: 18 }, // SKU
  { wch: 20 }, // Barcode
  { wch: 35 }, // Name
  { wch: 20 }, // Category
  { wch: 20 }, // Brand
  { wch: 15 }, // Color
  { wch: 10 }, // Stock
  { wch: 15 }, // Minimum Stock
  { wch: 18 }, // Purchase
  { wch: 18 }, // Selling
  { wch: 40 }, // Description
  { wch: 22 }, // Created At
  { wch: 15 }, // Status
];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Products"
  );
  const summary = [
  {
    Metric: "Total Products",
    Value: products.length,
  },
  {
    Metric: "Total Stock",
    Value: products.reduce(
      (sum, item) => sum + item.stock,
      0
    ),
  },
  {
    Metric: "Inventory Value",
    Value: products.reduce(
      (sum, item) =>
        sum + item.purchasePrice * item.stock,
      0
    ),
  },
  {
    Metric: "Low Stock",
    Value: products.filter(
      (item) =>
        item.stock > 0 &&
        item.stock <= item.minimumStock
    ).length,
  },
  {
    Metric: "Out Of Stock",
    Value: products.filter(
      (item) => item.stock <= 0
    ).length,
  },
];

const summarySheet =
  XLSX.utils.json_to_sheet(summary);

summarySheet["!cols"] = [
  { wch: 30 },
  { wch: 20 },
];

XLSX.utils.book_append_sheet(
  workbook,
  summarySheet,
  "Summary"
);

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `HardMotion-Products-${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}