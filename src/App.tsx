import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { StockMove } from "./pages/StockMove";
import { History } from "./pages/History";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />

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
    </Router>
  );
}