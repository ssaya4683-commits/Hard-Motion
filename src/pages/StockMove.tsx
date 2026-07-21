import { useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { AppLayout } from "../layouts/AppLayout";
import { useInventory } from "../hooks/useInventory";
import type { TransactionType } from "../types";

export function StockMove({ type }: { type: TransactionType }) {
  const { products, moveStock } = useInventory();
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const title = type === "in" ? "Barang Masuk" : "Barang Keluar";
  return <AppLayout><Card className="max-w-2xl"><h1 className="mb-4 text-3xl font-black">{title}</h1><form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); const product = products.find((p) => p.id === Number(productId)); if (product) await moveStock(product, type, quantity, note || title); setQuantity(1); setNote(""); }}><select required value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"><option value="">Pilih produk</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} - stok {p.stock}</option>)}</select><input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"/><textarea placeholder="Catatan" value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"/><Button>Simpan {title}</Button></form></Card></AppLayout>;
}
