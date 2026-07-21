import { Activity, AlertTriangle, Boxes, Package } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../components/Card";
import { AppLayout } from "../layouts/AppLayout";
import { useInventory } from "../hooks/useInventory";
import { formatDate } from "../utils/format";

export function Dashboard() {
  const { products, transactions, summary } = useInventory();
  const stats = [["Total Produk", summary.totalProducts, Package], ["Total Stok", summary.totalStock, Boxes], ["Barang Hampir Habis", summary.lowStock, AlertTriangle], ["Aktivitas", transactions.length, Activity]] as const;
  return <AppLayout><div className="space-y-6"><div><h1 className="text-3xl font-black">Dashboard</h1><p className="text-slate-500">Ringkasan operasional Hard Motion hari ini.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value, Icon]) => <Card key={label}><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">{label}</p><strong className="text-3xl">{value}</strong></div><Icon className="text-emerald-500"/></div></Card>)}</div><div className="grid gap-6 xl:grid-cols-3"><Card className="xl:col-span-2"><h2 className="mb-4 text-xl font-bold">Grafik Stok</h2><ResponsiveContainer width="100%" height={320}><BarChart data={products}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="stock" fill="#059669" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></Card><Card><h2 className="mb-4 text-xl font-bold">Aktivitas Terbaru</h2><div className="space-y-3">{transactions.slice(0, 6).map((t) => <div key={t.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><b>{t.type === "in" ? "Masuk" : "Keluar"}: {t.productName}</b><p className="text-sm text-slate-500">{t.quantity} pcs • {formatDate(t.createdAt)}</p></div>)}</div></Card></div></div></AppLayout>;
}
