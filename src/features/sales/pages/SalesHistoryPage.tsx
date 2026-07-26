import { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";

import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import { formatCurrency, formatDate } from "../../../utils/format";
import { salesService, type SaleRecord } from "../services/salesService";

const PAGE_SIZE = 10;
const ALL_PAYMENT_METHODS = "ALL";

type DateFilter = "ALL" | "TODAY" | "MONTH";

const paymentMethodLabels: Record<string, string> = {
  CASH: "Cash",
  TRANSFER: "Transfer",
  QRIS: "QRIS",
};

const getInvoiceNumber = (sale: SaleRecord) => sale.invoiceNumber ?? sale.id;
const getCustomerName = (sale: SaleRecord) => sale.customerName?.trim() || "Walk-in Customer";
const getSaleTotal = (sale: SaleRecord) => sale.total ?? sale.subtotal;
const getItemCount = (sale: SaleRecord) =>
  sale.items.reduce((total, item) => total + item.quantity, 0);

const isSameDay = (date: Date, compareDate: Date) =>
  date.getFullYear() === compareDate.getFullYear() &&
  date.getMonth() === compareDate.getMonth() &&
  date.getDate() === compareDate.getDate();

const isSameMonth = (date: Date, compareDate: Date) =>
  date.getFullYear() === compareDate.getFullYear() &&
  date.getMonth() === compareDate.getMonth();

export function SalesHistoryPage() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [query, setQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(ALL_PAYMENT_METHODS);
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadSales = async () => {
      setSales(await salesService.getAll());
    };

    void loadSales();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, paymentMethod, dateFilter]);

  const now = new Date();

  const summary = useMemo(() => {
    const todaysSales = sales.filter((sale) => isSameDay(new Date(sale.createdAt), now));
    const monthlySales = sales.filter((sale) => isSameMonth(new Date(sale.createdAt), now));

    return {
      todaysTransactions: todaysSales.length,
      todaysRevenue: todaysSales.reduce((total, sale) => total + getSaleTotal(sale), 0),
      monthlyRevenue: monthlySales.reduce((total, sale) => total + getSaleTotal(sale), 0),
    };
  }, [sales, now]);

  const paymentMethods = useMemo(
    () => Array.from(new Set(sales.map((sale) => sale.payment.method))).sort(),
    [sales]
  );

  const filteredSales = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      const matchesKeyword =
        !keyword ||
        getInvoiceNumber(sale).toLowerCase().includes(keyword) ||
        getCustomerName(sale).toLowerCase().includes(keyword);
      const matchesPayment =
        paymentMethod === ALL_PAYMENT_METHODS || sale.payment.method === paymentMethod;
      const matchesDate =
        dateFilter === "ALL" ||
        (dateFilter === "TODAY" && isSameDay(saleDate, now)) ||
        (dateFilter === "MONTH" && isSameMonth(saleDate, now));

      return matchesKeyword && matchesPayment && matchesDate;
    });
  }, [dateFilter, now, paymentMethod, query, sales]);

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / PAGE_SIZE));
  const paginatedSales = filteredSales.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Sales History</h1>
        <p className="text-sm text-slate-500">Riwayat transaksi penjualan dari POS.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Today's transactions</p>
          <p className="mt-2 text-3xl font-black">{summary.todaysTransactions}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Today's revenue</p>
          <p className="mt-2 text-3xl font-black">{formatCurrency(summary.todaysRevenue)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Monthly revenue</p>
          <p className="mt-2 text-3xl font-black">{formatCurrency(summary.monthlyRevenue)}</p>
        </Card>
      </div>

      <Card>
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search invoice number or customer..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
          />
          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
          >
            <option value={ALL_PAYMENT_METHODS}>All payment methods</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>{paymentMethodLabels[method] ?? method}</option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value as DateFilter)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="ALL">All dates</option>
            <option value="TODAY">Today</option>
            <option value="MONTH">This month</option>
          </select>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-3 py-3">Invoice Number</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3 text-right">Item Count</th>
                <th className="px-3 py-3 text-right">Total</th>
                <th className="px-3 py-3">Payment Method</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedSales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-3 py-4 font-semibold">{getInvoiceNumber(sale)}</td>
                  <td className="px-3 py-4">{formatDate(sale.createdAt)}</td>
                  <td className="px-3 py-4">{getCustomerName(sale)}</td>
                  <td className="px-3 py-4 text-right">{getItemCount(sale)}</td>
                  <td className="px-3 py-4 text-right font-bold">{formatCurrency(getSaleTotal(sale))}</td>
                  <td className="px-3 py-4">{paymentMethodLabels[sale.payment.method] ?? sale.payment.method}</td>
                  <td className="px-3 py-4 text-right">
                    <Button type="button" variant="secondary" onClick={() => setSelectedSale(sale)} className="inline-flex items-center gap-2">
                      <Eye size={16} /> Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginatedSales.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">Tidak ada transaksi ditemukan.</p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">Page {page} of {totalPages} • {filteredSales.length} transactions</p>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
            <Button type="button" variant="secondary" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</Button>
          </div>
        </div>
      </Card>

      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Invoice {getInvoiceNumber(selectedSale)}</h3>
                <p className="text-sm text-slate-500">{formatDate(selectedSale.createdAt)}</p>
              </div>
              <Button type="button" variant="secondary" onClick={() => setSelectedSale(null)}>Close</Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div><p className="text-sm text-slate-500">Customer</p><p className="font-semibold">{getCustomerName(selectedSale)}</p></div>
              <div><p className="text-sm text-slate-500">Payment method</p><p className="font-semibold">{paymentMethodLabels[selectedSale.payment.method] ?? selectedSale.payment.method}</p></div>
              <div className="md:col-span-2"><p className="text-sm text-slate-500">Notes</p><p className="font-semibold">{selectedSale.notes?.trim() || "-"}</p></div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
                  <tr><th className="px-3 py-3">Product</th><th className="px-3 py-3">Size</th><th className="px-3 py-3 text-right">Quantity</th><th className="px-3 py-3 text-right">Price</th><th className="px-3 py-3 text-right">Subtotal</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {selectedSale.items.map((item) => (
                    <tr key={`${item.productId}-${item.size}`}>
                      <td className="px-3 py-4 font-semibold">{item.productName}</td>
                      <td className="px-3 py-4">{item.size}</td>
                      <td className="px-3 py-4 text-right">{item.quantity}</td>
                      <td className="px-3 py-4 text-right">{formatCurrency(item.price)}</td>
                      <td className="px-3 py-4 text-right font-bold">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end text-xl font-black">Grand total: {formatCurrency(getSaleTotal(selectedSale))}</div>
          </div>
        </div>
      )}
    </div>
  );
}
