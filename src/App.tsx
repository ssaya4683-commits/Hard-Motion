import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/providers/ToastProvider";

import { AppLayout } from "./layouts/AppLayout";

import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { StockMove } from "./pages/StockMove";
import { History } from "./pages/History";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { SalesPage } from "./features/sales/pages/SalesPage";

export default function App() {
  return (
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <ToastProvider />

    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route
          path="/stock-in"
          element={<StockMove type="IN" />}
        />
        <Route
          path="/stock-out"
          element={<StockMove type="OUT" />}
        />
        <Route path="/history" element={<History />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AppLayout>
  </BrowserRouter>
);
}