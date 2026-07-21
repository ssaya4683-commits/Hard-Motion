import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardPage from "../features/dashboard/DashboardPage";
import ProductPage from "../features/products/ProductPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductPage />} />
      </Routes>
    </BrowserRouter>
  );
}