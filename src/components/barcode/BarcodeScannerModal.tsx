import type { Product } from "../../types";
import { Button } from "../common/Button";
import { BarcodeScanner } from "./BarcodeScanner";

type Props = {
  open: boolean;
  onClose: () => void;
  onProductFound: (product: Product, barcode: string) => void;
  onProductNotFound: (barcode: string) => void;
};

export function BarcodeScannerModal({
  open,
  onClose,
  onProductFound,
  onProductNotFound,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="barcode-scanner-modal-title"
        className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="barcode-scanner-modal-title" className="text-xl font-black">
              Scan Barcode
            </h2>
            <p className="text-sm text-slate-500">
              Arahkan kamera belakang ke barcode CODE128, EAN13, atau EAN8.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </div>

        <BarcodeScanner
          className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
          startLabel="Start Scan"
          stopLabel="Stop Scan"
          stopOnProductFound={false}
          stopOnProductNotFound={false}
          duplicateScanDelayMs={1500}
          onProductFound={onProductFound}
          onProductNotFound={onProductNotFound}
        />
      </div>
    </div>
  );
}
