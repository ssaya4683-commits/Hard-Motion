import { Printer, X } from "lucide-react";

interface ProductActionsProps {
  onPrint(): void;
  onClose(): void;
}

export default function ProductActions({
  onPrint,
  onClose,
}: ProductActionsProps) {
  return (
    <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">

      <button
        type="button"
        onClick={onPrint}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        <Printer size={18} />
        Cetak Barcode
      </button>

      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
      >
        <X size={18} />
        Tutup
      </button>

    </div>
  );
}