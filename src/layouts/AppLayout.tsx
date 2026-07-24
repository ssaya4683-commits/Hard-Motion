import {
  BarChart3,
  Home,
  Menu,
  Moon,
  Package,
  Settings,
  ShoppingCart,
  Sun,
  Truck,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";

const nav = [
  ["/", "Dashboard", Home],
  ["/products", "Produk", Package],
  ["/stock-in", "Barang Masuk", Truck],
  ["/stock-out", "Barang Keluar", ShoppingCart],
  ["/history", "Riwayat", Menu],
  ["/reports", "Laporan", BarChart3],
  ["/settings", "Pengaturan", Settings],
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => localStorage.theme === "dark");
  const [open, setOpen] = useState(false);

  document.documentElement.classList.toggle("dark", dark);

  const menu = (
    <nav className="space-y-2">
      {nav.map(([to, label, Icon]) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
              isActive
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-wide">
            HARD MOTION
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Premium Quality Outfit
          </p>
        </div>

        {menu}
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="h-full w-72 bg-white p-6 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8">
              <h1 className="text-2xl font-black">
                HARD MOTION
              </h1>

              <p className="text-sm text-slate-500">
                Premium Quality Outfit
              </p>
            </div>

            {menu}
          </aside>
        </div>
      )}

      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <button
            className="lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>

          <div>
            <h2 className="font-bold">
              Hard Motion Inventory
            </h2>

            <p className="text-xs text-slate-500">
              Catalog • Stock • Reports
            </p>
          </div>

          <button
            onClick={() => {
              const next = !dark;
              setDark(next);
              localStorage.theme = next ? "dark" : "light";
            }}
            className="rounded-xl border p-2 dark:border-slate-700"
          >
            {dark ? <Sun /> : <Moon />}
          </button>
        </header>

        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}