import { zodResolver } from "@hookform/resolvers/zod";
import { Package, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../components/Button";
import type { Product } from "../types";
import { fileToDataUrl } from "../utils/file";

const schema = z.object({
  sku: z.string().trim().min(1, "SKU is required"),
  barcode: z.string().trim().optional().default(""),
  name: z.string().trim().min(1, "Product name is required"),
  category: z.string().trim().optional().default(""),
  brand: z.string().trim().optional().default(""),
  size: z.string().trim().optional().default(""),
  color: z.string().trim().optional().default(""),
  purchasePrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0, "Selling price is required"),
  stock: z.coerce.number().min(0, "Stock is required"),
  minimumStock: z.coerce.number().min(0),
  description: z.string().trim().optional().default(""),
});
type FormValues = z.output<typeof schema>;

type Props = { product?: Product; onClose: () => void; onSave: (p: Omit<Product, "createdAt" | "updatedAt"> & { id?: number }) => Promise<void>; isSkuDuplicate: (sku: string, id?: number) => Promise<boolean>; };

const defaults: FormValues = { sku: "", barcode: "", name: "", category: "", brand: "", size: "", color: "", purchasePrice: 0, sellingPrice: 0, stock: 0, minimumStock: 0, description: "" };

export function ProductForm({ product, onSave, onClose, isSkuDuplicate }: Props) {
  const [image, setImage] = useState(product?.image ?? "");
  const [duplicateSku, setDuplicateSku] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) as never, defaultValues: product ?? defaults });
  useEffect(() => { reset(product ?? defaults); setImage(product?.image ?? ""); setDuplicateSku(""); }, [product, reset]);
  const inputClass = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950";
  const fields: [keyof FormValues, string, string][] = [["sku","SKU *","text"],["barcode","Barcode","text"],["name","Product Name *","text"],["category","Category","text"],["brand","Brand","text"],["size","Size","text"],["color","Color","text"],["purchasePrice","Purchase Price","number"],["sellingPrice","Selling Price *","number"],["stock","Stock *","number"],["minimumStock","Minimum Stock","number"]];
  return <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4"><form className="my-6 w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onSubmit={handleSubmit(async (data) => { setDuplicateSku(""); if (await isSkuDuplicate(data.sku, product?.id)) { setDuplicateSku("SKU already exists. Use a unique SKU."); return; } await onSave({ ...data, id: product?.id, image }); })}><div className="mb-5 flex items-center justify-between"><div><h2 className="text-2xl font-black">{product ? "Edit Product" : "Add Product"}</h2><p className="text-sm text-slate-500">Manage complete product details and IndexedDB image storage.</p></div><button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800">✕</button></div><div className="grid gap-5 lg:grid-cols-[180px_1fr]"><div><div className="flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">{image ? <img src={image} className="h-full w-full object-cover" alt="Product preview"/> : <Package className="text-slate-400" size={42}/>}</div><label className="mt-3 block cursor-pointer rounded-xl border border-dashed border-slate-300 px-3 py-2 text-center text-sm font-semibold dark:border-slate-700">{image ? "Replace image" : "Upload image"}<input className="hidden" type="file" accept="image/*" onChange={async (e) => e.target.files?.[0] && setImage(await fileToDataUrl(e.target.files[0]))}/></label>{image && <button type="button" onClick={() => setImage("")} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 dark:bg-red-950/40"><Trash2 size={16}/> Delete image</button>}</div><div className="grid gap-3 md:grid-cols-2">{fields.map(([name,label,type]) => <label key={name} className="text-sm font-semibold">{label}<input type={type} step={type === "number" ? "0.01" : undefined} className={inputClass} {...register(name)}/>{errors[name] && <span className="text-xs text-red-500">{errors[name]?.message?.toString()}</span>}{name === "sku" && duplicateSku && <span className="text-xs text-red-500">{duplicateSku}</span>}</label>)}<label className="text-sm font-semibold md:col-span-2">Description<textarea rows={4} className={inputClass} {...register("description")}/></label></div></div><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button><Button disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Product"}</Button></div></form></div>;
}
