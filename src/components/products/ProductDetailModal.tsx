import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { X } from "lucide-react";

import { Card } from "../common/Card";

import ProductInfo from "./ProductInfo";
import ProductDescription from "./ProductDescription";
import ProductSizeTable from "./ProductSizeTable";
import ProductHistory from "./ProductHistory";
import ProductActions from "./ProductActions";

import PrintBarcodeModal from "../barcode/PrintBarcodeModal";

import { useInventory } from "../../hooks/useInventory";

import type {
  Product,
  ProductSize,
  Transaction,
} from "../../types";

interface ProductDetailModalProps {
  product?: Product;
  onClose(): void;
}

export function ProductDetailModal({
  product,
  onClose,
}: ProductDetailModalProps) {

  const {
    getSizes,
    transactions,
  } = useInventory();

  const [
    sizes,
    setSizes,
  ] = useState<ProductSize[]>([]);

  const [
    printOpen,
    setPrintOpen,
  ] = useState(false);
    useEffect(() => {

    async function load() {

      if (!product?.id) return;

      const result =
        await getSizes(product.id);

      setSizes(result);

    }

    void load();

  }, [product, getSizes]);

  const totalStock = useMemo(
    () =>
      sizes.reduce(
        (sum, item) =>
          sum + item.stock,
        0
      ),
    [sizes]
  );

  const history = useMemo(
    () =>
      transactions
        .filter(
          (
            transaction:
              Transaction
          ) =>
            transaction.productId ===
            product?.id
        )
        .sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        ),
    [transactions, product]
  );

  if (!product) {
    return null;
  }

  return (

    <>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">

        <Card className="max-h-[90vh] w-full max-w-5xl overflow-y-auto">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                {product.sku}
              </p>

              <h2 className="text-2xl font-black">
                {product.name}
              </h2>

            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X />
            </button>

          </div>

          {product.image ? (

            <img
              src={product.image}
              alt={product.name}
              className="my-6 h-80 w-full rounded-2xl object-cover"
            />

          ) : (

            <div className="my-6 flex h-80 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">

              No Image

            </div>

          )}

          <ProductInfo
            product={product}
            totalStock={totalStock}
          />

          <ProductDescription
            product={product}
          />
                    <ProductSizeTable
            product={product}
            sizes={sizes}
          />

          <ProductHistory
            history={history}
          />

          <ProductActions
            onPrint={() =>
              setPrintOpen(true)
            }
            onClose={onClose}
          />

        </Card>

      </div>

      <PrintBarcodeModal
        open={printOpen}
        onClose={() =>
          setPrintOpen(false)
        }
        product={product}
        sizes={sizes}
      />

    </>

  );
}