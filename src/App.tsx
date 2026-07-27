import {
  HashRouter,
  Routes,
  Route,
} from "react-router-dom";;
import { ToastProvider } from "./components/providers/ToastProvider";

import { AppLayout } from "./layouts/AppLayout";

import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { StockMove } from "./pages/StockMove";
import { History } from "./pages/History";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { ImportProducts } from "./pages/ImportProducts";
import { ExportProducts } from "./pages/ExportProducts";
import { SalesPage } from "./features/sales/pages/SalesPage";
import { SalesHistoryPage } from "./features/sales/pages/SalesHistoryPage";
import { ReceiptPage } from "./features/receipt/pages/ReceiptPage";
import { LoadingProvider } from "./components/providers/LoadingProvider";
import { CustomerDisplay } from "./pages/CustomerDisplay";
export default function App() {
  return (
  <HashRouter>
  <ToastProvider />

  <LoadingProvider>
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/import-products" element={<ImportProducts />} />
        <Route path="/export-products" element={<ExportProducts />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/sales-history" element={<SalesHistoryPage />} />
        <Route path="/receipt/:saleId" element={<ReceiptPage />} />
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
        <Route
    path="/customer-display"
    element={<CustomerDisplay />}
/>
      </Routes>
    </AppLayout>
  </LoadingProvider>
</HashRouter>
);
}