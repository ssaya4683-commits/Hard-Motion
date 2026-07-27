import { useEffect, useState } from "react";

import { Card } from "../common/Card";
import { useInventory } from "../../hooks/useInventory";

import type {
  Product,
  ProductSize,
} from "../../types";

interface Props {
  product: Product;
}

export default function CatalogCard({
  product,
}: Props) {
  const {
    getImages,
    getSizes,
    getTotalStock,
  } = useInventory();

  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [stock, setStock] = useState(0);
  const [coverImage, setCoverImage] = useState(
    product.image || "/no-image.png"
  );

  useEffect(() => {
    if (product.id == null) return;

    const productId = product.id;

    async function load() {
      const imageList = await getImages(productId);
      const sizeList = await getSizes(productId);
      const totalStock = await getTotalStock(productId);

      setSizes(sizeList);
      setStock(totalStock);

      const cover =
        imageList.find((img) => img.isCover) ??
        imageList[0];

      if (cover?.image) {
        setCoverImage(cover.image);
      } else if (product.image) {
        setCoverImage(product.image);
      } else {
        setCoverImage("/no-image.png");
      }
    }

    void load();
  }, [
    product.id,
    product.image,
    getImages,
    getSizes,
    getTotalStock,
  ]);

  return (
    <Card className="overflow-hidden rounded-2xl transition hover:shadow-xl">
      <img
        src={coverImage}
        alt={product.name}
        className="h-64 w-full object-cover"
      />

      <div className="space-y-4 p-5">
        <div>
          <h2 className="text-xl font-bold">
            {product.name}
          </h2>

          <p className="mt-1 text-2xl font-black text-blue-600">
            Rp{" "}
            {product.sellingPrice.toLocaleString("id-ID")}
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm text-slate-500">
            Ukuran
          </p>

          <div className="flex flex-wrap gap-2">
            {sizes.length > 0 ? (
              sizes.map((size) => (
                <span
                  key={size.id}
                  className="rounded-lg bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800"
                >
                  {size.size}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">
                Tidak ada ukuran
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-sm text-slate-500">
            Total Stok
          </span>

          <span
            className={`rounded-lg px-3 py-1 text-sm font-bold ${
              stock > 0
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {stock} Pasang
          </span>
        </div>
      </div>
    </Card>
  );
}