import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { History } from "./pages/History";
import { Products } from "./pages/Products";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { StockMove } from "./pages/StockMove";

export default function App() {
  return <Router><Routes><Route path="/" element={<Dashboard/>}/><Route path="/products" element={<Products/>}/><Route path="/stock-in" element={<StockMove type="in"/>}/><Route path="/stock-out" element={<StockMove type="out"/>}/><Route path="/history" element={<History/>}/><Route path="/reports" element={<Reports/>}/><Route path="/settings" element={<Settings/>}/></Routes></Router>;
}
