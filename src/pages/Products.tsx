import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { AppLayout } from "../layouts/AppLayout";
import { useInventory } from "../hooks/useInventory";
import type { Product } from "../types";
import { formatCurrency } from "../utils/format";
import { ProductForm } from "./ProductForm";

export function Products() {
  const { products, saveProduct, deleteProduct } = useInventory();
  const [editing, setEditing] = useState<Product | undefined>();
  const [show, setShow] = useState(false);
  return <AppLayout><div className="space-y-6"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><h1 className="text-3xl font-black">Produk</h1><p className="text-slate-500">CRUD produk lengkap dengan foto, barcode, SKU, kategori, merek, ukuran, warna, harga, dan stok minimum.</p></div><Button onClick={() => { setEditing(undefined); setShow(!show); }}><Plus size={18}/> Tambah Produk</Button></div>{show && <Card><ProductForm product={editing} onSave={async (p) => { await saveProduct(p); setShow(false); }}/></Card>}<Card className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead><tr className="text-left text-slate-500"><th>Foto</th><th>SKU/Barcode</th><th>Produk</th><th>Kategori</th><th>Stok</th><th>Harga Modal</th><th>Harga Jual</th><th>Aksi</th></tr></thead><tbody>{products.map((p) => <tr key={p.id} className="border-t border-slate-200 dark:border-slate-800"><td className="py-3">{p.photo ? <img src={p.photo} className="h-12 w-12 rounded-xl object-cover"/> : "-"}</td><td><b>{p.sku}</b><br/><span className="text-slate-500">{p.barcode}</span></td><td>{p.name}<br/><span className="text-slate-500">{p.brand} • {p.size} • {p.color}</span></td><td>{p.category}</td><td className={p.stock <= p.minStock ? "font-bold text-red-500" : ""}>{p.stock} / min {p.minStock}</td><td>{formatCurrency(p.costPrice)}</td><td>{formatCurrency(p.salePrice)}</td><td><button onClick={() => { setEditing(p); setShow(true); }} className="mr-2 text-emerald-600"><Pencil size={18}/></button><button onClick={() => p.id && deleteProduct(p.id)} className="text-red-600"><Trash2 size={18}/></button></td></tr>)}</tbody></table></Card></div></AppLayout>;
}
