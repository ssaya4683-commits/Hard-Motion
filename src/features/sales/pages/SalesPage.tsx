import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import { BarcodeScannerModal } from "../../../components/barcode/BarcodeScannerModal";
import { inventoryService } from "../../../services/inventoryService";
import { playErrorBeep, playSuccessBeep } from "../../../utils/audio";
import { formatCurrency } from "../../../utils/format";
import type { Product, ProductSize } from "../../../types";
import { PaymentModal } from "../components/PaymentModal";
import { useCart, type CartItem } from "../hooks/useCart";
import { salesService, type SalePayment } from "../services/salesService";
import {
  sendCustomerDisplay,
} from "../../../services/customerDisplayService";

interface PendingStockMove {
  product: Product;
  item: CartItem;
}

interface SizeSelectionState {
  product: Product;
  sizes: ProductSize[];
}

function getSizePrice(size: ProductSize, product: Product) {
  const candidate = size as ProductSize & { sellingPrice?: unknown; price?: unknown };
  const value = typeof candidate.sellingPrice === "number"
    ? candidate.sellingPrice
    : candidate.price;

  return typeof value === "number" ? value : product.sellingPrice;
}

export function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sizesByProductId, setSizesByProductId] = useState<Record<number, ProductSize[]>>({});
  const [query, setQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number>();
  const [selectedSize, setSelectedSize] = useState<number>();
  const [showPayment, setShowPayment] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [sizeSelection, setSizeSelection] = useState<SizeSelectionState | null>(null);
  const [error, setError] = useState("");

  const cart = useCart();
  const navigate = useNavigate();

  const loadProducts = async () => {
    const nextProducts = await inventoryService.getProducts();
    setProducts(nextProducts);

    const sizeEntries = await Promise.all(
      nextProducts
        .filter((product) => product.id != null)
        .map(async (product) => [product.id!, await inventoryService.getSizes(product.id!)] as const)
    );

    setSizesByProductId(Object.fromEntries(sizeEntries));
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return products.filter((product) =>
      !keyword ||
      [product.name, product.sku, product.barcode, product.brand, product.category]
        .some((value) => value?.toLowerCase().includes(keyword))
    );
  }, [products, query]);

  const selectedProduct = products.find((product) => product.id === selectedProductId);
  const availableSizes = selectedProductId ? sizesByProductId[selectedProductId] ?? [] : [];

  const addSelectedSizeToCart = useCallback(
    (product: Product, size: number) => {
      setSelectedProductId(product.id);
      setSelectedSize(size);
      cart.addItem(product, size);
      setError("");
      playSuccessBeep();
      toast.success(`Added: ${product.name} size ${size}`);
    },
    [cart]
  );

  const addScannedProductToCart = useCallback(
    async (product: Product) => {
      if (product.id == null) {
        toast.error("Product not found.");
        return;
      }

      const productSizes = sizesByProductId[product.id] ?? await inventoryService.getSizes(product.id);

      setSizesByProductId((current) => ({
        ...current,
        [product.id!]: productSizes,
      }));
      setSelectedProductId(product.id);

      if (productSizes.length === 0) {
        setError("Produk hasil scan belum memiliki ukuran.");
        toast.error("Produk belum memiliki ukuran.");
        playErrorBeep();
        return;
      }

      if (productSizes.length === 1) {
        const [onlySize] = productSizes;

        if (onlySize.stock <= 0) {
          setError("Stok produk hasil scan tidak tersedia.");
          toast.error("Stok produk tidak tersedia.");
          playErrorBeep();
          return;
        }

        addSelectedSizeToCart(product, onlySize.size);
        return;
      }

      setScannerOpen(false);
      setSizeSelection({
        product,
        sizes: [...productSizes].sort((a, b) => a.size - b.size),
      });
      setError("");
      toast.info("Pilih ukuran produk hasil scan.");
    },
    [addSelectedSizeToCart, sizesByProductId]
  );

  const handleScannedProductFound = useCallback(
    (product: Product) => {
      void addScannedProductToCart(product);
    },
    [addScannedProductToCart]
  );

  const handleScannedProductNotFound = useCallback(() => {
    playErrorBeep();
    toast.error("Barcode not found");
  }, []);

  const handleScannedSizeSelected = (size: ProductSize) => {
    if (!sizeSelection || size.stock <= 0) return;

    addSelectedSizeToCart(sizeSelection.product, size.size);
    setSizeSelection(null);
  };

  const handleAddToCart = () => {
    if (!selectedProduct || selectedSize == null) {
      setError("Pilih produk dan ukuran terlebih dahulu.");
      return;
    }

    const sizeStock = availableSizes.find((item) => item.size === selectedSize);

    if (!sizeStock || sizeStock.stock <= 0) {
      setError("Stok ukuran yang dipilih tidak tersedia.");
      return;
    }

    cart.addItem(selectedProduct, selectedSize);
    setError("");
    toast.success("Produk ditambahkan ke cart.");
  };
  useEffect(() => {
  sendCustomerDisplay({
    items: cart.items,
    subtotal: cart.subtotal,
  });
}, [cart.items, cart.subtotal]);

  const handleCheckout = async (payment: SalePayment) => {
    setCheckingOut(true);
    setError("");

    try {
      const latestProducts = await inventoryService.getProducts();
      const stockMoves: PendingStockMove[] = [];

      for (const item of cart.items) {
        const product = latestProducts.find((candidate) => candidate.id === item.productId);

        if (!product || product.id == null) {
          throw new Error(`Produk ${item.productName} tidak ditemukan.`);
        }

        const productSizes = await inventoryService.getSizes(product.id);
        const selectedStock = productSizes.find((size) => size.size === item.size);

        if (!selectedStock || selectedStock.stock < item.quantity) {
          throw new Error(
            `Stok ${item.productName} ukuran ${item.size} tidak mencukupi.`
          );
        }

        stockMoves.push({ product, item });
      }

      const sale = await salesService.save({
        items: cart.items,
        subtotal: cart.subtotal,
        payment,
      });

      for (const { product, item } of stockMoves) {
        await inventoryService.moveStock({
          product,
          size: item.size,
          type: "OUT",
          quantity: item.quantity,
          note: `Penjualan POS - ${sale.invoiceNumber}`,
          transactionMeta: {
            saleId: sale.id,
            invoiceNumber: sale.invoiceNumber,
            customerName: sale.customerName,
            sku: item.sku,
            price: item.price,
            subtotal: sale.subtotal,
            total: sale.total,
            paymentMethod: sale.payment.method,
            paidAmount: sale.payment.paidAmount,
            paymentNotes: sale.notes,
            saleCreatedAt: sale.createdAt,
            createdAt: sale.createdAt,
          },
        });
      }

      cart.clearCart();
      setShowPayment(false);
      await loadProducts();
      toast.success("Transaksi berhasil disimpan dan stok dikurangi.");
      navigate(`/receipt/${sale.id}`);
    } catch (checkoutError) {
      const message = checkoutError instanceof Error
        ? checkoutError.message
        : "Checkout gagal diproses.";

      setError(message);
      toast.error(message);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Point of Sale</h1>
        <p className="text-sm text-slate-500">Cari produk, masukkan ke cart, lalu checkout.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">Product Search</h2>
                <p className="text-sm text-slate-500">Scan barcode atau cari produk secara manual.</p>
              </div>
            </div>

            <Button type="button" onClick={() => setScannerOpen(true)} className="w-full sm:w-auto">
              📷 Scan Barcode
            </Button>

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama, SKU, barcode, brand..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
            />

            <div className="grid gap-3 md:grid-cols-2">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    setSelectedProductId(product.id);
                    setSelectedSize(undefined);
                  }}
                  className={`rounded-xl border p-4 text-left transition ${
                    selectedProductId === product.id
                      ? "border-slate-900 bg-slate-100 dark:border-white dark:bg-slate-800"
                      : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="font-bold">{product.name}</div>
                  <div className="text-sm text-slate-500">{product.sku} • Stok {product.stock}</div>
                  <div className="mt-2 font-semibold">{formatCurrency(product.sellingPrice)}</div>
                </button>
              ))}
            </div>

            {selectedProduct && (
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <h3 className="font-bold">Pilih Ukuran</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size.id ?? size.size}
                      type="button"
                      disabled={size.stock <= 0}
                      onClick={() => setSelectedSize(size.size)}
                      className={`rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                        selectedSize === size.size
                          ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                          : "border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {size.size} ({size.stock})
                    </button>
                  ))}
                </div>
                <Button type="button" className="mt-4" onClick={handleAddToCart}>
                  Tambah ke Cart
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Cart</h2>
            {cart.items.length === 0 ? (
              <p className="text-sm text-slate-500">Cart masih kosong.</p>
            ) : (
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{item.productName}</div>
                        <div className="text-sm text-slate-500">SKU {item.sku} • Size {item.size}</div>
                        <div className="text-sm">{formatCurrency(item.price)}</div>
                      </div>
                      <button type="button" className="text-sm text-red-600" onClick={() => cart.removeItem(item.productId, item.size)}>
                        Hapus
                      </button>
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) => cart.updateQuantity(item.productId, item.size, Number(event.target.value))}
                      className="mt-3 w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                    />
                    <div className="mt-2 text-right font-bold">{formatCurrency(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-black dark:border-slate-800">
              <span>Subtotal</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>

            <Button type="button" className="w-full" disabled={!cart.items.length} onClick={() => setShowPayment(true)}>
              Checkout
            </Button>
          </div>
        </Card>
      </div>

      <BarcodeScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onProductFound={handleScannedProductFound}
        onProductNotFound={handleScannedProductNotFound}
      />

      <SizeSelectionModal
        selection={sizeSelection}
        onClose={() => setSizeSelection(null)}
        onSelect={handleScannedSizeSelected}
      />

      <PaymentModal
        open={showPayment}
        total={cart.subtotal}
        loading={checkingOut}
        onClose={() => setShowPayment(false)}
        onConfirm={handleCheckout}
      />
    </div>
  );
}


interface SizeSelectionModalProps {
  selection: SizeSelectionState | null;
  onClose: () => void;
  onSelect: (size: ProductSize) => void;
}

function SizeSelectionModal({ selection, onClose, onSelect }: SizeSelectionModalProps) {
  if (!selection) return null;

  const { product, sizes } = selection;
  const showPrice = sizes.some((size) => getSizePrice(size, product) !== product.sellingPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-selection-modal-title"
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-950"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="size-selection-modal-title" className="text-xl font-black">
              Pilih Ukuran
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Barcode cocok dengan {product.name}. Pilih ukuran yang akan ditambahkan ke cart.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 font-semibold">Size</th>
                <th className="px-4 py-3 font-semibold">Current Stock</th>
                {showPrice && <th className="px-4 py-3 font-semibold">Price</th>}
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {sizes.map((size) => {
                const outOfStock = size.stock <= 0;

                return (
                  <tr key={size.id ?? `${product.id}-${size.size}`} className={outOfStock ? "opacity-50" : undefined}>
                    <td className="px-4 py-3 font-semibold">{size.size}</td>
                    <td className="px-4 py-3">{size.stock}</td>
                    {showPrice && <td className="px-4 py-3">{formatCurrency(getSizePrice(size, product))}</td>}
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={outOfStock}
                        onClick={() => onSelect(size)}
                      >
                        {outOfStock ? "Stok Habis" : "Pilih"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
