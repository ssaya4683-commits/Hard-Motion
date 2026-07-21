import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  BarChart3,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menus = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/",
  },
  {
    icon: Package,
    label: "Produk",
    path: "/products",
  },
  {
    icon: Boxes,
    label: "Inventori",
    path: "/inventory",
  },
  {
    icon: ShoppingCart,
    label: "Penjualan",
    path: "/sales",
  },
  {
    icon: BarChart3,
    label: "Laporan",
    path: "/reports",
  },
  {
    icon: Settings,
    label: "Pengaturan",
    path: "/settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-2xl font-bold text-emerald-400">
          Hard Motion
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Inventory & POS
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {menus.map((menu) => {
          const Icon = menu.icon;

          return (
            <NavLink
              key={menu.label}
              to={menu.path}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-lg px-4 py-3 transition ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={20} />
              <span>{menu.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <p className="text-center text-xs text-slate-500">
          Hard Motion v1.0
        </p>
      </div>
    </aside>
  );
}