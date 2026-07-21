import { Card } from "../components/Card";
import { AppLayout } from "../layouts/AppLayout";
import { useInventory } from "../hooks/useInventory";
import { formatDate } from "../utils/format";
export function History() { const { transactions } = useInventory(); return <AppLayout><Card><h1 className="mb-4 text-3xl font-black">Riwayat Transaksi</h1><div className="overflow-x-auto"><table className="w-full min-w-[640px]"><thead><tr className="text-left text-slate-500"><th>Tanggal</th><th>Produk</th><th>Tipe</th><th>Qty</th><th>Catatan</th></tr></thead><tbody>{transactions.map((t) => <tr key={t.id} className="border-t border-slate-200 dark:border-slate-800"><td className="py-3">{formatDate(t.createdAt)}</td><td>{t.productName}</td><td>{t.type === "in" ? "Masuk" : "Keluar"}</td><td>{t.quantity}</td><td>{t.note}</td></tr>)}</tbody></table></div></Card></AppLayout>; }
