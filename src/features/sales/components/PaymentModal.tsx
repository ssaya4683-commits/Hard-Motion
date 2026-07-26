import { useState } from "react";

import { Button } from "../../../components/common/Button";
import { formatCurrency } from "../../../utils/format";
import type { SalePayment } from "../services/salesService";

interface PaymentModalProps {
  open: boolean;
  total: number;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payment: SalePayment) => Promise<void> | void;
}

export function PaymentModal({
  open,
  total,
  loading = false,
  onClose,
  onConfirm,
}: PaymentModalProps) {
  const [method, setMethod] = useState("CASH");
  const [paidAmount, setPaidAmount] = useState(total);
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [notes, setNotes] = useState("");

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <h3 className="text-xl font-bold">Pembayaran</h3>
        <p className="mt-2 text-sm text-slate-500">Total checkout: {formatCurrency(total)}</p>

        <div className="mt-5 space-y-4">
          <label className="block text-sm font-medium">
            Customer
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Nama customer"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>

          <label className="block text-sm font-medium">
            Metode Pembayaran
            <select
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="CASH">Cash</option>
              <option value="TRANSFER">Transfer</option>
              <option value="QRIS">QRIS</option>
            </select>
          </label>

          <label className="block text-sm font-medium">
            Jumlah Dibayar
            <input
              type="number"
              min={0}
              value={paidAmount}
              onChange={(event) => setPaidAmount(Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>

          <label className="block text-sm font-medium">
            Notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Catatan transaksi"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm({ method, paidAmount, customerName, notes })}
            disabled={loading || paidAmount < total}
          >
            {loading ? "Memproses..." : "Konfirmasi"}
          </Button>
        </div>
      </div>
    </div>
  );
}
