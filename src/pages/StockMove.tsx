import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";

import { useInventory } from "../hooks/useInventory";

import { AppLayout } from "../layouts/AppLayout";

import type {
  ProductSize,
  TransactionType,
} from "../types";
export function StockMove({
  type,
}: {
  type: TransactionType;
}) {
  const {
    products,
    moveStock,
    getSizes,
  } = useInventory();

  const [
    productId,
    setProductId,
  ] = useState("");

  const [
    size,
    setSize,
  ] = useState("");

  const [
    sizes,
    setSizes,
  ] = useState<ProductSize[]>(
    []
  );

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    note,
    setNote,
  ] = useState("");

  const title =
    type === "IN"
      ? "Barang Masuk"
      : "Barang Keluar";

  const selectedProduct =
    useMemo(
      () =>
        products.find(
          (p) =>
            p.id ===
            Number(productId)
        ),
      [products, productId]
    );
      useEffect(() => {
    async function loadSizes() {
      if (!productId) {
        setSizes([]);
        setSize("");
        return;
      }

      const result =
        await getSizes(
          Number(productId)
        );

      setSizes(result);

      if (result.length) {
        setSize(
          String(
            result[0].size
          )
        );
      }
    }

    void loadSizes();
  }, [productId, getSizes]);
    const selectedSize = useMemo(
    () =>
      sizes.find(
        (item) =>
          item.size === Number(size)
      ),
    [sizes, size]
  );

  return (
    <AppLayout>
      <Card className="max-w-2xl">
        <h1 className="mb-6 text-3xl font-black">
          {title}
        </h1>

        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();

            if (
              !selectedProduct ||
              !size
            )
              return;

            await moveStock({
              product: selectedProduct,
              size: Number(size),
              type,
              quantity,
              note:
                note.trim() ||
                title,
            });

            setQuantity(1);
            setNote("");
          }}
        >
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Produk
            </label>

            <select
              required
              value={productId}
              onChange={(e) =>
                setProductId(
                  e.target.value
                )
              }
              className="w-full rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">
                Pilih produk
              </option>

              {products.map(
                (product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Ukuran
            </label>

            <select
              required
              value={size}
              onChange={(e) =>
                setSize(
                  e.target.value
                )
              }
              disabled={
                !sizes.length
              }
              className="w-full rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">
                Pilih ukuran
              </option>

              {sizes.map((item) => (
                <option
                  key={item.size}
                  value={item.size}
                >
                  {item.size}
                </option>
              ))}
            </select>
          </div>

          {selectedSize && (
            <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span>
                  Stok ukuran{" "}
                  <strong>
                    {
                      selectedSize.size
                    }
                  </strong>
                </span>

                <span className="text-lg font-bold">
                  {
                    selectedSize.stock
                  }{" "}
                  pasang
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Jumlah
            </label>

            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Number(
                    e.target.value
                  )
                )
              }
              className="w-full rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Catatan
            </label>

            <textarea
              value={note}
              onChange={(e) =>
                setNote(
                  e.target.value
                )
              }
              placeholder="Contoh: Penjualan toko"
              className="w-full rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
                    <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <Button
              type="submit"
              disabled={
                !productId ||
                !size ||
                quantity < 1 ||
                (type === "OUT" &&
                  !!selectedSize &&
                  quantity > selectedSize.stock)
              }
            >
              {type === "IN"
                ? "Simpan Barang Masuk"
                : "Simpan Barang Keluar"}
            </Button>
          </div>
        </form>
      </Card>
    </AppLayout>
  );
}