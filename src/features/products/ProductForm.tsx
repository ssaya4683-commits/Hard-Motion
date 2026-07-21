import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../../components/ui/Button";
import Input from "../../components/form/Input";
import InputNumber from "../../components/form/InputNumber";

import { fileToBase64 } from "../../utils/image";
import { productService } from "../../database/productService";
import type { Product } from "../../database/db";
import {
  productSchema,
  type ProductFormValues,
} from "./ProductSchema";

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
}

export default function ProductForm({
  product,
  onSuccess,
}: ProductFormProps) {
  const [preview, setPreview] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      kode: "",
      barcode: "",
      nama: "",
      kategori: "",
      merek: "",
      warna: "",
      ukuran: "",
      hargaBeli: 0,
      hargaJual: 0,
      stok: 0,
      stokMinimum: 0,
    },
  });

  useEffect(() => {
    if (product) {
      reset(product);
      setPreview(product.foto ?? "");
    } else {
      reset();
      setPreview("");
    }
  }, [product, reset]);

  async function onSelectFile(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    setPreview(base64);
  }

  async function onSubmit(data: ProductFormValues) {
    const payload = {
      ...data,
      foto: preview,
    };

    if (product?.id) {
      await productService.update(product.id, payload);
    } else {
      await productService.add({
        ...payload,
        createdAt: new Date(),
      });
    }

    reset();
    setPreview("");
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      <div className="flex flex-col items-center gap-3">

        <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl border bg-slate-100">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-slate-500">
              Belum ada foto
            </span>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={onSelectFile}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Kode Produk" {...register("kode")} />
        <Input label="Barcode" {...register("barcode")} />
        <Input label="Nama Produk" {...register("nama")} />
        <Input label="Kategori" {...register("kategori")} />
        <Input label="Merek" {...register("merek")} />
        <Input label="Warna" {...register("warna")} />
        <Input label="Ukuran" {...register("ukuran")} />
        <InputNumber label="Harga Beli" {...register("hargaBeli",{valueAsNumber:true})}/>
        <InputNumber label="Harga Jual" {...register("hargaJual",{valueAsNumber:true})}/>
        <InputNumber label="Stok" {...register("stok",{valueAsNumber:true})}/>
        <InputNumber label="Stok Minimum" {...register("stokMinimum",{valueAsNumber:true})}/>
      </div>

      {(errors.kode || errors.nama) && (
        <div className="text-sm text-red-600">
          {errors.kode?.message || errors.nama?.message}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={()=>{
          reset();
          setPreview("");
        }}>
          Reset
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {product ? "Simpan Perubahan" : "Simpan Produk"}
        </Button>
      </div>
    </form>
  );
}
