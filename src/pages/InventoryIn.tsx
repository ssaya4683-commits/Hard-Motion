import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { BarcodeScanner } from "../components/barcode/BarcodeScanner";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { useInventory } from "../hooks/useInventory";
import { barcodeService } from "../services/barcodeService";
import { notificationService } from "../services/notificationService";
import type { Product, ProductSize } from "../types";

export function InventoryIn() {
  const { getProductById, getSizes, moveStock, refresh } = useInventory();
  const [barcode, setBarcode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const quantityRef = useRef<HTMLInputElement>(null);

  const selectedVariant = useMemo(
    () => sizes.find((item) => item.size === Number(selectedSize)),
    [selectedSize, sizes]
  );

  const resetProduct = useCallback(() => {
    setSelectedProduct(null);
    setSizes([]);
    setSelectedSize("");
    setQuantity(1);
  }, []);

  const loadProduct = useCallback(
    async (product: Product, scannedBarcode: string) => {
      if (!product.id) {
        resetProduct();
        setMessage("Product not found");
        notificationService.error("Product not found");
        return;
      }

      const productSizes = await getSizes(product.id);

      setBarcode(scannedBarcode);
      setSelectedProduct(product);
      setSizes(productSizes);
      setSelectedSize(productSizes.length === 1 ? String(productSizes[0].size) : "");
      setQuantity(1);
      setMessage("");

      window.setTimeout(() => {
        quantityRef.current?.focus();
        quantityRef.current?.select();
      }, 0);
    },
    [getSizes, resetProduct]
  );

  const handleProductNotFound = useCallback(
    (scannedBarcode: string) => {
      setBarcode(scannedBarcode);
      resetProduct();
      setMessage("Product not found");
      notificationService.error("Product not found");
    },
    [resetProduct]
  );

  const findProductByBarcode = useCallback(async () => {
    const value = barcode.trim();

    if (!value) {
      return;
    }

    const product = await barcodeService.getProductByBarcode(value);

    if (!product) {
      handleProductNotFound(value);
      return;
    }

    await loadProduct(product, value);
  }, [barcode, handleProductNotFound, loadProduct]);

  useEffect(() => {
    if (!selectedProduct || selectedSize || sizes.length !== 1) {
      return;
    }

    setSelectedSize(String(sizes[0].size));
  }, [selectedProduct, selectedSize, sizes]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProduct || !selectedSize || quantity < 1) {
      return;
    }

    setSaving(true);

    try {
      await moveStock({
        product: selectedProduct,
        size: Number(selectedSize),
        type: "IN",
        quantity,
        note: "Barang Masuk",
      });

      const [updatedSizes, updatedProduct] = selectedProduct.id
        ? await Promise.all([getSizes(selectedProduct.id), getProductById(selectedProduct.id)])
        : [[], undefined];

      setSizes(updatedSizes);

      if (updatedProduct) {
        setSelectedProduct(updatedProduct);
      }
      setQuantity(1);
      setMessage("Stock updated successfully");
      notificationService.success("Barang masuk tersimpan");
      await refresh();
    } catch (error) {
      console.error("INVENTORY IN ERROR", error);
      notificationService.error(
        "Gagal menyimpan barang masuk",
        error instanceof Error ? error.message : "Terjadi kesalahan."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Inventory In</p>
          <h1 className="text-3xl font-black">📥 Barang Masuk</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Scan barcode, pilih varian ukuran, lalu simpan jumlah barang masuk.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,480px)]">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold">Scan / Barcode</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={barcode}
                  onChange={(event) => {
                    setBarcode(event.target.value);
                    setMessage("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void findProductByBarcode();
                    }
                  }}
                  placeholder="Scan atau ketik barcode..."
                  className="w-full rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"
                />
                <Button type="button" onClick={() => void findProductByBarcode()}>
                  Find Product
                </Button>
              </div>
              {message && (
                <p className={`mt-3 rounded-xl p-3 text-sm font-semibold ${message === "Product not found" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>
                  {message}
                </p>
              )}
            </div>

            <BarcodeScanner
              className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
              startLabel="Start Scan"
              stopLabel="Stop Scan"
              stopOnProductFound={false}
              stopOnProductNotFound={false}
              onProductFound={loadProduct}
              onProductNotFound={handleProductNotFound}
            />
          </div>

          <form className="space-y-5 rounded-2xl border border-slate-200 p-5 dark:border-slate-800" onSubmit={handleSave}>
            <div>
              <h2 className="text-xl font-black">Product</h2>
              {selectedProduct ? (
                <div className="mt-3 rounded-xl bg-slate-100 p-4 dark:bg-slate-900">
                  <p className="text-lg font-bold">{selectedProduct.name}</p>
                  <p className="text-sm text-slate-500">SKU: {selectedProduct.sku}</p>
                  <p className="text-sm text-slate-500">Barcode: {selectedProduct.barcode}</p>
                  <p className="mt-2 text-sm font-semibold">Total stock: {selectedProduct.stock} pasang</p>
                </div>
              ) : (
                <p className="mt-3 rounded-xl bg-slate-100 p-4 text-sm text-slate-500 dark:bg-slate-900">
                  Product akan tampil setelah barcode ditemukan.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Pilih Ukuran / Variant</label>
              <select
                required
                value={selectedSize}
                onChange={(event) => setSelectedSize(event.target.value)}
                disabled={!sizes.length}
                className="w-full rounded-xl border p-3 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:disabled:bg-slate-900"
              >
                <option value="">Pilih ukuran</option>
                {sizes.map((item) => (
                  <option key={item.id ?? item.size} value={item.size}>
                    Size {item.size} — stok {item.stock}
                  </option>
                ))}
              </select>
            </div>

            {sizes.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {sizes.map((item) => (
                  <button
                    key={item.id ?? item.size}
                    type="button"
                    onClick={() => setSelectedSize(String(item.size))}
                    className={`rounded-xl border p-3 text-left transition ${selectedSize === String(item.size) ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" : "border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900"}`}
                  >
                    <span className="block text-sm font-bold">Size {item.size}</span>
                    <span className="text-xs opacity-80">Stok {item.stock}</span>
                  </button>
                ))}
              </div>
            )}

            {selectedVariant && (
              <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
                Stok size <strong>{selectedVariant.size}</strong> akan bertambah dari <strong>{selectedVariant.stock}</strong> menjadi <strong>{selectedVariant.stock + quantity}</strong> pasang.
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold">Jumlah Barang Masuk</label>
              <input
                ref={quantityRef}
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                disabled={!selectedProduct}
                className="w-full rounded-xl border p-3 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:disabled:bg-slate-900"
              />
            </div>

            <Button type="submit" disabled={!selectedProduct || !selectedSize || quantity < 1 || saving}>
              {saving ? "Menyimpan..." : "Save Barang Masuk"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
