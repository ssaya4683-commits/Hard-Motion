import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BarcodeScannerModal } from "../components/barcode/BarcodeScannerModal";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { useInventory } from "../hooks/useInventory";
import { notificationService } from "../services/notificationService";
import type { Product, ProductSize, TransactionType } from "../types";

export function StockMove({
  type,
}: {
  type: TransactionType;
}) {
  const { products, moveStock, getSizes } = useInventory();
  const [productId, setProductId] = useState("");
  const [barcode, setBarcode] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const productRef = useRef<HTMLSelectElement>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [size, setSize] = useState("");
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  const title = type === "IN" ? "Barang Masuk" : "Barang Keluar";
  const isImport = type === "IN";

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === Number(productId)),
    [products, productId]
  );

  useEffect(() => {
    if (isImport) {
      return;
    }

    const code = barcode.trim();

    if (!code) {
      return;
    }

    const found = products.find(
      (product) => String(product.barcode ?? "").trim() === code
    );

    if (found?.id) {
      setProductId(String(found.id));
    }
  }, [barcode, isImport, products]);

  useEffect(() => {
    async function loadSizes() {
      if (!productId) {
        setSizes([]);
        setSize("");
        return;
      }

      const result = await getSizes(Number(productId));

      setSizes(result);

      if (result.length) {
        setSize(String(result[0].size));
      }
    }

    void loadSizes();
  }, [productId, getSizes]);

  const selectedSize = useMemo(
    () => sizes.find((item) => item.size === Number(size)),
    [sizes, size]
  );

  const focusProductField = useCallback(() => {
    window.setTimeout(() => {
      productRef.current?.focus();
    }, 0);
  }, []);

  const handleImportBarcodeScanned = useCallback(
    (scannedBarcode: string) => {
      setBarcode(scannedBarcode);
      setScannerOpen(false);
      focusProductField();
    },
    [focusProductField]
  );

  const handleExportProductFound = useCallback((product: Product, scannedBarcode: string) => {
    if (!product.id) {
      notificationService.error("Product not found.");
      return;
    }

    setBarcode(scannedBarcode);
    setProductId(String(product.id));
    setScannerOpen(false);
  }, []);

  const handleExportProductNotFound = useCallback(() => {
    notificationService.error("Product not found.");
  }, []);

  return (
    <>
      <div className="space-y-6">
        <Card className="max-w-2xl">
          <h1 className="mb-6 text-3xl font-black">{title}</h1>

          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();

              if (!selectedProduct || !size) return;

              try {
                await moveStock({
                  product: selectedProduct,
                  size: Number(size),
                  type,
                  quantity,
                  note: note.trim() || title,
                });
              } catch (error) {
                console.error("MOVE STOCK ERROR", error);
                notificationService.error(
                  "Stok Tidak Mencukupi",
                  error instanceof Error ? error.message : "Terjadi kesalahan."
                );
                return;
              }

              setQuantity(1);
              setNote("");
              setBarcode("");
              setProductId("");
              setSize("");
              barcodeRef.current?.focus();
            }}
          >
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Scan / Barcode
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  ref={barcodeRef}
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan atau ketik barcode..."
                  className="w-full rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"
                />
                <Button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="shrink-0"
                >
                  📷 Scan Barcode
                </Button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Produk</label>

              <select
                ref={productRef}
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">Pilih produk</option>

                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Ukuran</label>

              <select
                required
                value={size}
                onChange={(e) => setSize(e.target.value)}
                disabled={!sizes.length}
                className="w-full rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">Pilih ukuran</option>

                {sizes.map((item) => (
                  <option key={item.size} value={item.size}>
                    {item.size}
                  </option>
                ))}
              </select>
            </div>

            {selectedSize && (
              <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span>
                    Stok ukuran <strong>{selectedSize.size}</strong>
                  </span>

                  <span className="text-lg font-bold">
                    {selectedSize.stock} pasang
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold">Jumlah</label>

              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={!selectedProduct}
                className="w-full rounded-xl border p-3 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:disabled:bg-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Catatan</label>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Penjualan toko"
                className="w-full rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
              <Button type="submit" disabled={!productId || !size || quantity < 1}>
                {type === "IN" ? "Simpan Barang Masuk" : "Simpan Barang Keluar"}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <BarcodeScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onBarcodeScanned={isImport ? handleImportBarcodeScanned : undefined}
        onProductFound={isImport ? undefined : handleExportProductFound}
        onProductNotFound={isImport ? undefined : handleExportProductNotFound}
        stopOnProductFound={isImport}
        stopOnProductNotFound={isImport}
      />
    </>
  );
}
