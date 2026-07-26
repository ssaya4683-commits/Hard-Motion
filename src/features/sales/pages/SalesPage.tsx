import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import { inventoryService } from "../../../services/inventoryService";
import { formatCurrency } from "../../../utils/format";
import type { Product, ProductSize } from "../../../types";
import { PaymentModal } from "../components/PaymentModal";
import { useCart, type CartItem } from "../hooks/useCart";
import { salesService, type SalePayment } from "../services/salesService";

interface PendingStockMove {
  product: Product;
  item: CartItem;
}

export function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sizesByProductId, setSizesByProductId] = useState<Record<number, ProductSize[]>>({});
  const [query, setQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number>();
  const [selectedSize, setSelectedSize] = useState<number>();
  const [showPayment, setShowPayment] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
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
            <h2 className="text-lg font-bold">Product Search</h2>
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
