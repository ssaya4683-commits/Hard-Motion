import {
  BarChart3,
  Home,
  Menu,
  Package,
  ScanBarcode,
  FileSpreadsheet,
  Settings,
  ShoppingCart,
  Truck,
} from "lucide-react";

export const navigation = [
  ["/", "Dashboard", Home],
  ["/products", "Produk", Package],
  ["/barcode-scanner", "Scan Barcode", ScanBarcode],
  ["/import-products", "Import Produk", FileSpreadsheet],
  ["/export-products", "Export Produk", FileSpreadsheet],
  ["/sales", "POS", ShoppingCart],
  ["/sales-history", "Sales History", Menu],
  ["/stock-in", "Barang Masuk", Truck],
  ["/stock-out", "Barang Keluar", ShoppingCart],
  ["/history", "Riwayat", Menu],
  ["/reports", "Laporan", BarChart3],
  ["/settings", "Pengaturan", Settings],
] as const;