import * as XLSX from "xlsx";

import type {
  Product,
  Transaction,
} from "../types";

export interface ReportSummary {
  totalProducts: number;
  totalStock: number;
  inventoryValue: number;
  lowStock: number;
}

interface ExportExcelOptions {
  products: Product[];
  transactions: Transaction[];
  summary: ReportSummary;
}

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function tanggal(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("id-ID");
}

function autoWidth(data: any[][]) {
  const cols: { wch: number }[] = [];

  data.forEach((row) => {
    row.forEach((cell, index) => {
      const length = String(
        cell ?? ""
      ).length;

      cols[index] ??= {
        wch: 10,
      };

      if (length + 4 > cols[index].wch) {
        cols[index].wch = length + 4;
      }
    });
  });

  return cols;
}

function createDashboard(
  summary: ReportSummary
) {
  const rows = [
    ["HARD MOTION"],
    ["Dashboard Inventori"],
    [],
    ["Tanggal Cetak", tanggal()],
    [],
    ["Ringkasan", "Nilai"],
    [
      "Total Produk",
      summary.totalProducts,
    ],
    [
      "Total Stok",
      summary.totalStock,
    ],
    [
      "Nilai Persediaan",
      rupiah(summary.inventoryValue),
    ],
    [
      "Stok Minimum",
      summary.lowStock,
    ],
  ];

  const sheet =
    XLSX.utils.aoa_to_sheet(rows);

  sheet["!cols"] =
    autoWidth(rows);

  return sheet;
}
function createProductsSheet(
  products: Product[]
) {
  const rows = [
    [
      "SKU",
      "Nama Produk",
      "Kategori",
      "Stok",
      "Stok Minimum",
      "Harga Beli",
      "Harga Jual",
      "Nilai Persediaan",
      "Tanggal Dibuat",
    ],

    ...products.map((product) => [
      product.sku,
      product.name,
      product.category,
      product.stock,
      product.minimumStock,
      rupiah(product.purchasePrice),
      rupiah(product.sellingPrice),
      rupiah(
        product.purchasePrice *
          product.stock
      ),
      tanggal(product.createdAt),
    ]),
  ];

  const sheet =
    XLSX.utils.aoa_to_sheet(rows);

  sheet["!cols"] =
    autoWidth(rows);

  return sheet;
}

function createTransactionSheet(
  transactions: Transaction[]
) {
  const rows = [
    [
      "Tanggal",
      "Jenis",
      "Produk",
      "Jumlah",
      "Catatan",
    ],

    ...transactions.map((trx) => [
      tanggal(trx.createdAt),
      trx.type,
      trx.productName ?? "-",
      trx.quantity,
      trx.note ?? "-",
    ]),
  ];

  const sheet =
    XLSX.utils.aoa_to_sheet(rows);

  sheet["!cols"] =
    autoWidth(rows);

  return sheet;
}

function createStatisticsSheet(
  products: Product[],
  transactions: Transaction[]
) {
  const totalIn = transactions
    .filter((t) => t.type === "IN")
    .reduce(
      (sum, t) => sum + t.quantity,
      0
    );

  const totalOut = transactions
    .filter((t) => t.type === "OUT")
    .reduce(
      (sum, t) => sum + t.quantity,
      0
    );

  const adjustment = transactions
    .filter(
      (t) => t.type === "ADJUSTMENT"
    )
    .reduce(
      (sum, t) => sum + t.quantity,
      0
    );

  const inventoryValue =
    products.reduce(
      (sum, p) =>
        sum +
        p.purchasePrice * p.stock,
      0
    );
      const lowStock = products.filter(
    (product) =>
      product.stock <=
      product.minimumStock
  ).length;

  const rows = [
    ["HARD MOTION"],
    ["Statistik Inventori"],
    [],
    ["Tanggal Cetak", tanggal()],
    [],
    ["Parameter", "Nilai"],

    [
      "Jumlah Produk",
      products.length,
    ],

    [
      "Total Transaksi",
      transactions.length,
    ],

    [
      "Barang Masuk",
      totalIn,
    ],

    [
      "Barang Keluar",
      totalOut,
    ],

    [
      "Penyesuaian",
      adjustment,
    ],

    [
      "Produk Stok Minimum",
      lowStock,
    ],

    [
      "Nilai Persediaan",
      rupiah(
        inventoryValue
      ),
    ],
  ];

  const sheet =
    XLSX.utils.aoa_to_sheet(rows);

  sheet["!cols"] =
    autoWidth(rows);

  return sheet;
}

function createLowStockSheet(
  products: Product[]
) {
  const rows = [
    [
      "SKU",
      "Nama Produk",
      "Kategori",
      "Stok",
      "Minimum",
    ],

    ...products
      .filter(
        (product) =>
          product.stock <=
          product.minimumStock
      )
      .map((product) => [
        product.sku,
        product.name,
        product.category,
        product.stock,
        product.minimumStock,
      ]),
  ];

  const sheet =
    XLSX.utils.aoa_to_sheet(rows);

  sheet["!cols"] =
    autoWidth(rows);

  return sheet;
}
function createInventoryValueSheet(
  products: Product[]
) {
  const rows = [
    [
      "SKU",
      "Produk",
      "Stok",
      "Harga Beli",
      "Nilai Persediaan",
    ],

    ...products.map((product) => [
      product.sku,
      product.name,
      product.stock,
      rupiah(product.purchasePrice),
      rupiah(
        product.stock *
          product.purchasePrice
      ),
    ]),
  ];

  const sheet =
    XLSX.utils.aoa_to_sheet(rows);

  sheet["!cols"] =
    autoWidth(rows);

  return sheet;
}

function createProductSummarySheet(
  products: Product[]
) {
  const categoryMap = new Map<
    string,
    number
  >();

  products.forEach((product) => {
    const total =
      categoryMap.get(
        product.category
      ) ?? 0;

    categoryMap.set(
      product.category,
      total + 1
    );
  });

  const rows = [
    [
      "Kategori",
      "Jumlah Produk",
    ],

    ...Array.from(
      categoryMap.entries()
    ),
  ];

  const sheet =
    XLSX.utils.aoa_to_sheet(rows);

  sheet["!cols"] =
    autoWidth(rows);

  return sheet;
}

function createWorkbook() {
  return XLSX.utils.book_new();
}
export function exportInventoryExcel({
  products,
  transactions,
  summary,
}: ExportExcelOptions) {
  const workbook = createWorkbook();

  XLSX.utils.book_append_sheet(
    workbook,
    createDashboard(summary),
    "Dashboard"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    createProductsSheet(products),
    "Produk"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    createTransactionSheet(transactions),
    "Transaksi"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    createStatisticsSheet(
      products,
      transactions
    ),
    "Statistik"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    createLowStockSheet(products),
    "Stok Minimum"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    createInventoryValueSheet(
      products
    ),
    "Nilai Persediaan"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    createProductSummarySheet(
      products
    ),
    "Ringkasan Kategori"
  );

  const filename = `HardMotion_Report_${
    new Date()
      .toISOString()
      .slice(0, 10)
  }.xlsx`;

  XLSX.writeFile(
    workbook,
    filename
  );
}
export function exportProductsToExcel(
  products: Product[]
) {
  exportInventoryExcel({
    products,
    transactions: [],
    summary: {
      totalProducts: products.length,
      totalStock: products.reduce(
        (t, p) => t + p.stock,
        0
      ),
      inventoryValue: products.reduce(
        (t, p) => t + p.stock * p.purchasePrice,
        0
      ),
      lowStock: products.filter(
        (p) => p.stock <= p.minimumStock
      ).length,
    },
  });
}