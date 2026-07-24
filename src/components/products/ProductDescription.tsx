import type { Product } from "../../types";

interface ProductDescriptionProps {
  product: Product;
}

export default function ProductDescription({
  product,
}: ProductDescriptionProps) {
  return (
    <div className="mt-6">

      <h3 className="mb-2 text-lg font-bold">
        Description
      </h3>

      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">

        {product.description?.trim()
          ? product.description
          : "-"}

      </div>

    </div>
  );
}