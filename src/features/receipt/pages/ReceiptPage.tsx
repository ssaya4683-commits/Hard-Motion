import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Printer } from "lucide-react";

import { Button } from "../../../components/common/Button";
import { formatCurrency } from "../../../utils/format";
import { receiptService, type ReceiptSale } from "../services/receiptService";

const formatReceiptDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));

const formatReceiptTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(value));

const paymentMethodLabels: Record<string, string> = {
  CASH: "Cash",
  TRANSFER: "Transfer",
  QRIS: "QRIS",
};

export function ReceiptPage() {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<ReceiptSale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add("receipt-print-mode");

    return () => {
      document.body.classList.remove("receipt-print-mode");
    };
  }, []);

  useEffect(() => {
    const loadReceipt = async () => {
      if (!saleId) {
        setLoading(false);
        return;
      }

      setReceipt(await receiptService.getBySaleId(saleId));
      setLoading(false);
    };

    void loadReceipt();
  }, [saleId]);

  const totalItems = useMemo(
    () => receipt?.items.reduce((total, item) => total + item.quantity, 0) ?? 0,
    [receipt]
  );

  if (loading) {
    return <p className="text-sm text-slate-500">Memuat struk...</p>;
  }

  if (!receipt) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-black">Struk tidak ditemukan</h1>
        <p className="text-sm text-slate-500">Data transaksi tidak tersedia untuk saleId ini.</p>
        <Button type="button" variant="secondary" onClick={() => navigate("/sales")}>
          Kembali ke POS
        </Button>
      </div>
    );
  }

  const change = Math.max(receipt.paidAmount - receipt.total, 0);

  return (
    <div className="receipt-page mx-auto max-w-2xl space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Receipt</h1>
          <p className="text-sm text-slate-500">Struk transaksi {receipt.invoiceNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2">
            <Printer size={16} /> Print
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/sales")}>
            Kembali ke POS
          </Button>
        </div>
      </div>

      <section className="receipt-print-area mx-auto w-[320px] bg-white p-5 font-mono text-sm text-slate-950 shadow-xl print:shadow-none">
        <div className="text-center">
          <h2 className="text-lg font-black uppercase tracking-widest">Hard Motion</h2>
          <p className="text-xs">Struk Transaksi</p>
        </div>

        <div className="my-4 border-t border-dashed border-slate-500" />

        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4"><span>No</span><span className="text-right">{receipt.invoiceNumber}</span></div>
          <div className="flex justify-between"><span>Tanggal</span><span>{formatReceiptDate(receipt.createdAt)}</span></div>
          <div className="flex justify-between"><span>Jam</span><span>{formatReceiptTime(receipt.createdAt)}</span></div>
          <div className="flex justify-between"><span>Kasir</span><span>POS</span></div>
        </div>

        <div className="my-4 border-t border-dashed border-slate-500" />

        <div className="space-y-3">
          {receipt.items.map((item) => (
            <div key={`${item.productId}-${item.size}-${item.productName}`}>
              <div className="font-semibold">{item.productName}</div>
              <div className="text-xs text-slate-600">SKU {item.sku}{item.size ? ` • Size ${item.size}` : ""}</div>
              <div className="mt-1 flex justify-between gap-3">
                <span>{item.quantity} x {formatCurrency(item.price)}</span>
                <span>{formatCurrency(item.quantity * item.price)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="my-4 border-t border-dashed border-slate-500" />

        <div className="space-y-1">
          <div className="flex justify-between"><span>Total item</span><span>{totalItems}</span></div>
          <div className="flex justify-between font-black"><span>Grand Total</span><span>{formatCurrency(receipt.total)}</span></div>
          <div className="flex justify-between"><span>Bayar</span><span>{formatCurrency(receipt.paidAmount)}</span></div>
          <div className="flex justify-between"><span>Kembalian</span><span>{formatCurrency(change)}</span></div>
          <div className="flex justify-between"><span>Metode</span><span>{paymentMethodLabels[receipt.paymentMethod] ?? receipt.paymentMethod}</span></div>
        </div>

        <div className="my-4 border-t border-dashed border-slate-500" />
        <p className="text-center text-xs">Terima kasih sudah berbelanja.</p>
      </section>
    </div>
  );
}
