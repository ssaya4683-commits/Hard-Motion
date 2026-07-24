import { zodResolver } from "@hookform/resolvers/zod";
import { Package, Trash2 } from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { inventoryService } from "../services/inventoryService";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../components/common/Button";
import { SHOE_SIZES } from "../constants/shoeSizes";

import type {
  Product,
  ProductSize,
} from "../types";

import { fileToDataUrl } from "../utils/file";

const schema = z.object({
  sku: z
    .string()
    .trim()
    .min(1, "SKU is required"),

  barcode: z
    .string()
    .trim()
    .optional()
    .default(""),

  name: z
    .string()
    .trim()
    .min(
      1,
      "Product name is required"
    ),

  category: z
    .string()
    .trim()
    .optional()
    .default(""),

  brand: z
    .string()
    .trim()
    .optional()
    .default("Hard Motion"),

  color: z
    .string()
    .trim()
    .optional()
    .default(""),

  purchasePrice:
    z.coerce.number().min(0),

  sellingPrice:
    z.coerce.number().min(0),

  minimumStock:
    z.coerce.number().min(0),

  description: z
    .string()
    .trim()
    .optional()
    .default(""),
});

type FormValues =
  z.output<typeof schema>;

type SaveProduct =
  Omit<
    Product,
    "createdAt" | "updatedAt"
  > & {
    id?: number;

    sizes?: Omit<
      ProductSize,
      "id" | "productId"
    >[];
  };

type Props = {
  product?: Product;

  onClose: () => void;

  onSave: (
    product: SaveProduct
  ) => Promise<void>;

  isSkuDuplicate: (
    sku: string,
    id?: number
  ) => Promise<boolean>;
};

const defaults: FormValues = {
  sku: "",

  barcode: "",

  name: "",

  category: "",

  brand: "Hard Motion",

  color: "",

  purchasePrice: 0,

  sellingPrice: 0,

  minimumStock: 0,

  description: "",
};

export function ProductForm({
  product,
  onSave,
  onClose,
  isSkuDuplicate,
}: Props) {
  const [image, setImage] =
    useState(
      product?.image ?? ""
    );

  const [
    duplicateSku,
    setDuplicateSku,
  ] = useState("");

  const [
    sizes,
    setSizes,
  ] = useState<
    Omit<
      ProductSize,
      "id" | "productId"
    >[]
  >(
    SHOE_SIZES.map(
      (size) => ({
        size,

        stock: 0,

        createdAt: "",
      })
    )
  );

  const totalStock =
    useMemo(
      () =>
        sizes.reduce(
          (
            total,
            item
          ) =>
            total +
            item.stock,
          0
        ),
      [sizes]
    );

  const {
    register,

    handleSubmit,

    reset,

    formState: {
      errors,

      isSubmitting,
    },
  } = useForm<FormValues>({
    resolver:
      zodResolver(
        schema
      ) as never,

    defaultValues:
      product ??
      defaults,
  });

  useEffect(() => {
  reset(product ?? defaults);

  setImage(product?.image ?? "");

  setDuplicateSku("");

  async function loadSizes() {
    if (!product?.id) {
      setSizes(
        SHOE_SIZES.map((size) => ({
          size,
          stock: 0,
          createdAt: "",
        }))
      );

      return;
    }

    const saved =
      await inventoryService.getSizes(
        product.id
      );

    setSizes(
      SHOE_SIZES.map((size) => {
        const existing =
          saved.find(
            (item) =>
              item.size === size
          );

        return (
          existing ?? {
            size,
            stock: 0,
            createdAt: "",
          }
        );
      })
    );
  }

  void loadSizes();
}, [product, reset]);

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4">
      <form
        className="my-6 w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onSubmit={handleSubmit(
          async (data) => {
            setDuplicateSku("");

            if (
              await isSkuDuplicate(
                data.sku,
                product?.id
              )
            ) {
              setDuplicateSku(
                "SKU already exists."
              );

              return;
            }

            await onSave({
              ...data,

              id: product?.id,

              image,

              stock: totalStock,

              size: "",

              sizes,
            });
          }
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">
              {product
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <p className="text-sm text-slate-500">
              Hard Motion
              Inventory
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div>
            <div className="flex h-56 w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
              {image ? (
                <img
                  src={image}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package
                  size={48}
                  className="text-slate-400"
                />
              )}
            </div>

            <label className="mt-3 block cursor-pointer rounded-xl border border-dashed border-slate-300 px-3 py-2 text-center text-sm font-semibold dark:border-slate-700">
              {image
                ? "Replace Image"
                : "Upload Image"}

              <input
                hidden
                type="file"
                accept="image/*"
                onChange={async (
                  e
                ) => {
                  if (
                    !e.target
                      .files?.length
                  )
                    return;

                  setImage(
                    await fileToDataUrl(
                      e.target
                        .files[0]
                    )
                  );
                }}
              />
            </label>

            {image && (
              <button
                type="button"
                onClick={() =>
                  setImage("")
                }
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 dark:bg-red-950/40"
              >
                <Trash2
                  size={16}
                />

                Delete Image
              </button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-semibold">
              SKU *

              <input
                className={
                  inputClass
                }
                {...register(
                  "sku"
                )}
              />

              {errors.sku && (
                <span className="text-xs text-red-500">
                  {
                    errors.sku
                      .message
                  }
                </span>
              )}

              {duplicateSku && (
                <span className="text-xs text-red-500">
                  {
                    duplicateSku
                  }
                </span>
              )}
            </label>

            <label className="text-sm font-semibold">
              Barcode

              <input
                className={
                  inputClass
                }
                {...register(
                  "barcode"
                )}
              />
            </label>

            <label className="text-sm font-semibold md:col-span-2">
              Product Name *

              <input
                className={
                  inputClass
                }
                {...register(
                  "name"
                )}
              />

              {errors.name && (
                <span className="text-xs text-red-500">
                  {
                    errors.name
                      .message
                  }
                </span>
              )}
            </label>

            <label className="text-sm font-semibold">
              Category

              <input
                className={
                  inputClass
                }
                {...register(
                  "category"
                )}
              />
            </label>

            <label className="text-sm font-semibold">
              Brand

              <input
                className={
                  inputClass
                }
                {...register(
                  "brand"
                )}
              />
            </label>

            <label className="text-sm font-semibold">
              Color

              <input
                className={
                  inputClass
                }
                {...register(
                  "color"
                )}
              />
            </label>

            <label className="text-sm font-semibold">
              Purchase Price

              <input
                type="number"
                className={
                  inputClass
                }
                {...register(
                  "purchasePrice"
                )}
              />
            </label>

            <label className="text-sm font-semibold">
              Selling Price

              <input
                type="number"
                className={
                  inputClass
                }
                {...register(
                  "sellingPrice"
                )}
              />
            </label>

            <label className="text-sm font-semibold">
              Minimum Stock

              <input
                type="number"
                className={
                  inputClass
                }
                {...register(
                  "minimumStock"
                )}
              />
            </label>

            <label className="text-sm font-semibold md:col-span-2">
              Description

              <textarea
                rows={4}
                className={
                  inputClass
                }
                {...register(
                  "description"
                )}
              />
            </label>
                        <div className="md:col-span-2 mt-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  Stock per Size
                </h3>

                <span className="rounded-lg bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {totalStock} Pasang
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {sizes.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={
                        item.size
                      }
                      className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                    >
                      <div className="mb-2 text-center text-sm font-bold">
                        Size {item.size}
                      </div>

                      <input
                        type="number"
                        min={0}
                        value={
                          item.stock
                        }
                        className={
                          inputClass
                        }
                        onChange={(
                          e
                        ) => {
                          const value =
                            Number(
                              e
                                .target
                                .value
                            ) || 0;

                          setSizes(
                            (
                              current
                            ) =>
                              current.map(
                                (
                                  size,
                                  i
                                ) =>
                                  i ===
                                  index
                                    ? {
                                        ...size,
                                        stock:
                                          value,
                                      }
                                    : size
                              )
                          );
                        }}
                      />
                    </div>
                  )
                )}
              </div>

              <div className="mt-5 rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>
                    Total Stock
                  </span>

                  <span>
                    {totalStock}
                    {" "}
                    Pasang
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Total stok dihitung otomatis dari seluruh ukuran sepatu.
                </p>
              </div>
            </div>
          </div>
        </div>
                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-700 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2 font-semibold transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <Button disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : product
              ? "Update Product"
              : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}