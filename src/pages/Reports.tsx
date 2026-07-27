import {
  FileSpreadsheet,
  FileText,
  Package,
  Archive,
  TriangleAlert,
  Wallet,
} from "lucide-react";

import { Card } from "../components/common/Card";

import { useInventory } from "../hooks/useInventory";

import {
  exportInventoryExcel,
} from "../services/excelService";

import {
  exportInventoryPdf,
} from "../services/pdfService";

function rupiah(
  value: number
) {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }
  ).format(value);
}

export function Reports() {
  const {
    products,
    transactions,
    summary,
  } = useInventory();

  const exportExcel = () => {
    exportInventoryExcel({
      products,
      transactions,
      summary,
    });
  };

  const exportPdf = () => {
    exportInventoryPdf({
      products,
      transactions,
      summary,
      storeName: "Hard Motion",
    });
  };

  const cards = [
    {
      title: "Total Produk",
      value: summary.totalProducts,
      icon: Package,
    },

    {
      title: "Total Stok",
      value: summary.totalStock,
      icon: Archive,
    },

    {
      title: "Nilai Persediaan",
      value: rupiah(
        summary.inventoryValue
      ),
      icon: Wallet,
    },

    {
      title: "Stok Minimum",
      value: summary.lowStock,
      icon: TriangleAlert,
    },
  ];
    return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Laporan
          </h1>

          <p className="text-muted-foreground">
            Ringkasan inventori dan ekspor data Hard Motion.
          </p>
        </div>

        <div className="flex gap-2">

          <button
  onClick={exportExcel}
  className="rounded-xl border border-slate-300 px-4 py-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </button>

          <button
  onClick={exportPdf}
  className="rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </button>

        </div>

      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card
              key={card.title}
              className="p-6"
            >
              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-muted-foreground">
                    {card.title}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {card.value}
                  </h2>

                </div>

                <Icon className="h-8 w-8 text-primary" />

              </div>

            </Card>
          );
        })}

      </div>
            <Card className="p-6">

        <h2 className="mb-4 text-xl font-semibold">
          Ringkasan Data
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          <div>

            <h3 className="mb-2 font-medium">
              Data Produk
            </h3>

            <ul className="space-y-2 text-sm text-muted-foreground">

              <li>
                Total Produk :
                {" "}
                <strong>
                  {products.length}
                </strong>
              </li>

              <li>
                Total Stok :
                {" "}
                <strong>
                  {summary.totalStock}
                </strong>
              </li>

              <li>
                Produk Stok Minimum :
                {" "}
                <strong>
                  {summary.lowStock}
                </strong>
              </li>

              <li>
                Nilai Persediaan :
                {" "}
                <strong>
                  {rupiah(summary.inventoryValue)}
                </strong>
              </li>

            </ul>

          </div>

          <div>

            <h3 className="mb-2 font-medium">
              Data Transaksi
            </h3>

            <ul className="space-y-2 text-sm text-muted-foreground">

              <li>
                Total Transaksi :
                {" "}
                <strong>
                  {transactions.length}
                </strong>
              </li>

              <li>
                Barang Masuk :
                {" "}
                <strong>
                  {
                    transactions.filter(
                      (t) =>
                        t.type === "IN"
                    ).length
                  }
                </strong>
              </li>

              <li>
                Barang Keluar :
                {" "}
                <strong>
                  {
                    transactions.filter(
                      (t) =>
                        t.type === "OUT"
                    ).length
                  }
                </strong>
              </li>

              <li>
                Penyesuaian :
                {" "}
                <strong>
                  {
                    transactions.filter(
                      (t) =>
                        t.type ===
                        "ADJUSTMENT"
                    ).length
                  }
                </strong>
              </li>

            </ul>

          </div>

        </div>

      </Card>
            <Card className="p-6">

        <h2 className="mb-4 text-xl font-semibold">
          Informasi
        </h2>

        <div className="space-y-3 text-sm text-muted-foreground">

          <p>
            • Export Excel menghasilkan
            workbook dengan beberapa sheet
            (Dashboard, Produk, Transaksi,
            Statistik, Stok Minimum, Nilai
            Persediaan, dan Ringkasan
            Kategori).
          </p>

          <p>
            • Export PDF menghasilkan
            laporan siap cetak lengkap dengan
            ringkasan, daftar produk,
            transaksi, statistik, stok minimum,
            serta nomor halaman.
          </p>

          <p>
            • Seluruh data diambil langsung
            dari database lokal Hard Motion.
          </p>

        </div>

      </Card>

    </div>
  );
}