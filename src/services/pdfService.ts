import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

interface ExportPdfOptions {
  products: Product[];
  transactions: Transaction[];
  summary: ReportSummary;
  storeName?: string;
}

const PAGE_MARGIN = 14;

function money(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function date(value?: string) {
  if (!value) return "-";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return value;
  }

  return d.toLocaleString("id-ID");
}

function line(
  doc: jsPDF,
  x: number,
  y: number,
  width: number
) {
  doc.setDrawColor(210);

  doc.line(
    x,
    y,
    x + width,
    y
  );
}

function title(doc: jsPDF) {
  doc.setFont("helvetica", "bold");

  doc.setFontSize(22);

  doc.text(
    "HARD MOTION",
    PAGE_MARGIN,
    20
  );

  doc.setFontSize(11);

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.text(
    "Laporan Inventori",
    PAGE_MARGIN,
    28
  );

  line(
    doc,
    PAGE_MARGIN,
    34,
    182
  );
}

function info(
  doc: jsPDF,
  storeName: string
) {
  doc.setFontSize(10);

  doc.text(
    `Toko : ${storeName}`,
    PAGE_MARGIN,
    42
  );

  doc.text(
    `Tanggal Cetak : ${new Date().toLocaleString(
      "id-ID"
    )}`,
    PAGE_MARGIN,
    48
  );
}

function summaryTable(
  doc: jsPDF,
  summary: ReportSummary
) {
  autoTable(doc, {
    startY: 56,

    head: [
      [
        "Ringkasan",
        "Nilai",
      ],
    ],

    body: [
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
        money(
          summary.inventoryValue
        ),
      ],

      [
        "Stok Minimum",
        summary.lowStock,
      ],
    ],

    styles: {
      fontSize: 10,
    },

    headStyles: {
      fillColor: [
        30,
        41,
        59,
      ],
    },
  });
}
function productTable(
  doc: jsPDF,
  products: Product[]
) {
  autoTable(doc, {
    startY:
      (doc as any).lastAutoTable
        ?.finalY + 8,

    head: [[
      "SKU",
      "Nama",
      "Kategori",
      "Stok",
      "Harga Beli",
      "Harga Jual",
    ]],

    body: products.map(
      (product) => [
        product.sku,
        product.name,
        product.category,
        product.stock,
        money(
          product.purchasePrice
        ),
        money(
          product.sellingPrice
        ),
      ]
    ),

    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: "linebreak",
    },

    headStyles: {
      fillColor: [
        37,
        99,
        235,
      ],
      textColor: 255,
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },

    columnStyles: {
      3: {
        halign: "center",
      },

      4: {
        halign: "right",
      },

      5: {
        halign: "right",
      },
    },
  });
}

function transactionTable(
  doc: jsPDF,
  transactions: Transaction[]
) {
  autoTable(doc, {
    startY:
      (doc as any).lastAutoTable
        ?.finalY + 10,

    head: [[
      "Tanggal",
      "Jenis",
      "Produk",
      "Qty",
      "Catatan",
    ]],

    body: transactions.map(
      (trx) => [
        date(trx.createdAt),
        trx.type,
        trx.productName ??
          "-",
        trx.quantity,
        trx.note ?? "-",
      ]
    ),

    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: "linebreak",
    },

    headStyles: {
      fillColor: [
        22,
        163,
        74,
      ],
      textColor: 255,
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },

    columnStyles: {
      3: {
        halign: "center",
      },
    },
  });
}
function footer(doc: jsPDF) {
  const pages = doc.getNumberOfPages();

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);

    doc.setDrawColor(220);

    doc.line(
      PAGE_MARGIN,
      287,
      196,
      287
    );

    doc.setFontSize(9);

    doc.setTextColor(120);

    doc.text(
      "Hard Motion Inventory System",
      PAGE_MARGIN,
      292
    );

    doc.text(
      `Halaman ${i} / ${pages}`,
      196,
      292,
      {
        align: "right",
      }
    );
  }
}

function inventoryValueTable(
  doc: jsPDF,
  products: Product[]
) {
  autoTable(doc, {
    startY:
      (doc as any).lastAutoTable
        ?.finalY + 10,

    head: [[
      "SKU",
      "Produk",
      "Stok",
      "Harga Beli",
      "Nilai Persediaan",
    ]],

    body: products.map(
      (product) => [
        product.sku,
        product.name,
        product.stock,
        money(
          product.purchasePrice
        ),
        money(
          product.purchasePrice *
            product.stock
        ),
      ]
    ),

    styles: {
      fontSize: 8,
      cellPadding: 2,
    },

    headStyles: {
      fillColor: [
        234,
        88,
        12,
      ],
      textColor: 255,
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [
        248,
        250,
        252,
      ],
    },

    columnStyles: {
      2: {
        halign: "center",
      },

      3: {
        halign: "right",
      },

      4: {
        halign: "right",
      },
    },
  });
}

function addNewPageIfNeeded(
  doc: jsPDF
) {
  const finalY =
    (doc as any).lastAutoTable
      ?.finalY ?? 0;

  if (finalY > 220) {
    doc.addPage();
  }
}
function reportStatistics(
  doc: jsPDF,
  products: Product[],
  transactions: Transaction[]
) {
  const totalIn = transactions
    .filter((t) => t.type === "IN")
    .reduce((sum, t) => sum + t.quantity, 0);

  const totalOut = transactions
    .filter((t) => t.type === "OUT")
    .reduce((sum, t) => sum + t.quantity, 0);

  const adjustment = transactions
    .filter((t) => t.type === "ADJUSTMENT")
    .reduce((sum, t) => sum + t.quantity, 0);

  const inventoryCost = products.reduce(
    (sum, p) =>
      sum + p.purchasePrice * p.stock,
    0
  );

  autoTable(doc, {
    startY:
      (doc as any).lastAutoTable
        ?.finalY + 10,

    head: [[
      "Statistik",
      "Nilai",
    ]],

    body: [
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
        "Jumlah Transaksi",
        transactions.length,
      ],

      [
        "Total Nilai Persediaan",
        money(inventoryCost),
      ],
    ],

    styles: {
      fontSize: 9,
      cellPadding: 3,
    },

    headStyles: {
      fillColor: [
        14,
        116,
        144,
      ],
      textColor: 255,
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [
        248,
        250,
        252,
      ],
    },

    columnStyles: {
      1: {
        halign: "right",
      },
    },
  });
}

function lowStockTable(
  doc: jsPDF,
  products: Product[]
) {
  const rows = products.filter(
    (p) =>
      p.stock > 0 &&
      p.stock <= p.minimumStock
  );

  if (!rows.length) {
    return;
  }

  addNewPageIfNeeded(doc);

  autoTable(doc, {
    startY:
      (doc as any).lastAutoTable
        ?.finalY + 10,

    head: [[
      "Produk Stok Minimum",
      "Kategori",
      "Stok",
      "Minimum",
    ]],

    body: rows.map((p) => [
      p.name,
      p.category,
      p.stock,
      p.minimumStock,
    ]),

    styles: {
      fontSize: 8,
      cellPadding: 2,
    },

    headStyles: {
      fillColor: [
        220,
        38,
        38,
      ],
      textColor: 255,
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [
        254,
        242,
        242,
      ],
    },

    columnStyles: {
      2: {
        halign: "center",
      },

      3: {
        halign: "center",
      },
    },
  });
}
function transactionSummary(
  doc: jsPDF,
  transactions: Transaction[]
) {
  const grouped = new Map<
    string,
    {
      masuk: number;
      keluar: number;
    }
  >();

  for (const trx of transactions) {
    const name =
      trx.productName ?? "Produk";

    if (!grouped.has(name)) {
      grouped.set(name, {
        masuk: 0,
        keluar: 0,
      });
    }

    const item =
      grouped.get(name)!;

    if (trx.type === "IN") {
      item.masuk +=
        trx.quantity;
    }

    if (trx.type === "OUT") {
      item.keluar +=
        trx.quantity;
    }
  }

  addNewPageIfNeeded(doc);

  autoTable(doc, {
    startY:
      (doc as any).lastAutoTable
        ?.finalY + 10,

    head: [[
      "Produk",
      "Masuk",
      "Keluar",
    ]],

    body: Array.from(
      grouped.entries()
    ).map(([name, value]) => [
      name,
      value.masuk,
      value.keluar,
    ]),

    styles: {
      fontSize: 8,
      cellPadding: 2,
    },

    headStyles: {
      fillColor: [
        79,
        70,
        229,
      ],
      textColor: 255,
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [
        248,
        250,
        252,
      ],
    },

    columnStyles: {
      1: {
        halign: "center",
      },

      2: {
        halign: "center",
      },
    },
  });
}

function notes(
  doc: jsPDF
) {
  addNewPageIfNeeded(doc);

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(12);

  doc.text(
    "Catatan",
    PAGE_MARGIN,
    ((doc as any)
      .lastAutoTable
      ?.finalY ?? 40) + 14
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(10);

  doc.text(
    [
      "- Laporan dibuat otomatis oleh Hard Motion.",
      "- Nilai persediaan dihitung menggunakan harga beli.",
      "- Data diambil langsung dari database lokal aplikasi.",
      "- Dokumen ini dapat digunakan sebagai arsip stok toko."
    ],
    PAGE_MARGIN,
    ((doc as any)
      .lastAutoTable
      ?.finalY ?? 40) + 22
  );
}
export function exportInventoryPdf({
  products,
  transactions,
  summary,
  storeName = "Hard Motion",
}: ExportPdfOptions) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  title(doc);

  info(doc, storeName);

  summaryTable(doc, summary);

  productTable(doc, products);

  inventoryValueTable(doc, products);

  reportStatistics(
    doc,
    products,
    transactions
  );

  if (transactions.length > 0) {
    addNewPageIfNeeded(doc);

    transactionTable(
      doc,
      transactions
    );

    transactionSummary(
      doc,
      transactions
    );
  }

  lowStockTable(
    doc,
    products
  );

  notes(doc);

  footer(doc);

  const filename = `HardMotion_Report_${
    new Date()
      .toISOString()
      .slice(0, 10)
  }.pdf`;

  doc.save(filename);
}