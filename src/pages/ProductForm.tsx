import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../components/Button";
import type { Product } from "../types";
import { fileToDataUrl } from "../utils/file";

const schema = z.object({ sku: z.string().min(1), barcode: z.string().min(1), name: z.string().min(1), category: z.string().min(1), brand: z.string().min(1), size: z.string().min(1), color: z.string().min(1), costPrice: z.coerce.number().min(0), salePrice: z.coerce.number().min(0), stock: z.coerce.number().min(0), minStock: z.coerce.number().min(0) });
type FormValues = z.output<typeof schema>;

export function ProductForm({ product, onSave }: { product?: Product; onSave: (p: Omit<Product, "createdAt" | "updatedAt"> & { id?: number }) => Promise<void> }) {
  const [photo, setPhoto] = useState(product?.photo ?? "");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) as never, defaultValues: product ?? { sku: "", barcode: "", name: "", category: "", brand: "", size: "", color: "", costPrice: 0, salePrice: 0, stock: 0, minStock: 0 } });
  useEffect(() => { reset(product); setPhoto(product?.photo ?? ""); }, [product, reset]);
  const fields: [keyof FormValues, string][] = [["sku","SKU"],["barcode","Barcode"],["name","Nama"],["category","Kategori"],["brand","Merek"],["size","Ukuran"],["color","Warna"],["costPrice","Harga Modal"],["salePrice","Harga Jual"],["stock","Stok"],["minStock","Stok Minimum"]];
  return <form className="space-y-4" onSubmit={handleSubmit((data) => onSave({ ...(data as unknown as FormValues), id: product?.id, photo }))}><div className="flex flex-col gap-3 sm:flex-row"><div className="h-32 w-32 overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-800">{photo && <img src={photo} className="h-full w-full object-cover" alt="Produk"/>}</div><input type="file" accept="image/*" onChange={async (e) => e.target.files?.[0] && setPhoto(await fileToDataUrl(e.target.files[0]))}/></div><div className="grid gap-3 md:grid-cols-2">{fields.map(([name,label]) => <label key={name} className="text-sm font-medium">{label}<input type={["costPrice","salePrice","stock","minStock"].includes(name) ? "number" : "text"} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" {...register(name)}/>{errors[name] && <span className="text-xs text-red-500">Wajib diisi dengan benar</span>}</label>)}</div><Button disabled={isSubmitting}>Simpan Produk</Button></form>;
}
