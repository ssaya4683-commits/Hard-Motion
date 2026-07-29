import { useCallback, useEffect, useId, useRef, useState } from "react";

import { useDuplicateScanGuard } from "../../hooks/useDuplicateScanGuard";
import { barcodeService } from "../../services/barcodeService";
import type { Product } from "../../types";

type Html5QrcodeResult = unknown;
type Html5QrcodeInstance = {
  isScanning: boolean;
  start: (
    cameraConfig: { facingMode: string },
    configuration: { fps: number; qrbox: { width: number; height: number }; aspectRatio: number },
    onSuccess: (decodedText: string, result: Html5QrcodeResult) => void,
    onError: () => void
  ) => Promise<void>;
  stop: () => Promise<void>;
  clear: () => Promise<void>;
};
type Html5QrcodeConstructor = new (
  elementId: string,
  config: { formatsToSupport: number[]; verbose: boolean }
) => Html5QrcodeInstance;
type Html5QrcodeModule = {
  Html5Qrcode: Html5QrcodeConstructor;
  Html5QrcodeSupportedFormats: { CODE_128: number; EAN_13: number; EAN_8: number };
};

declare global {
  interface Window {
    Html5Qrcode?: Html5QrcodeConstructor;
    Html5QrcodeSupportedFormats?: { CODE_128: number; EAN_13: number; EAN_8: number };
  }
}

const HTML5_QRCODE_CDN =
  "https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js";

async function loadHtml5Qrcode(): Promise<Html5QrcodeModule> {
  try {
    const dynamicImport = new Function("specifier", "return import(specifier)") as (
      specifier: string
    ) => Promise<Html5QrcodeModule>;

    return await dynamicImport("html5-qrcode");
  } catch {
    if (window.Html5Qrcode && window.Html5QrcodeSupportedFormats) {
      return {
        Html5Qrcode: window.Html5Qrcode,
        Html5QrcodeSupportedFormats: window.Html5QrcodeSupportedFormats,
      };
    }

    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${HTML5_QRCODE_CDN}"]`
      );

      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("html5-qrcode failed to load")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = HTML5_QRCODE_CDN;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("html5-qrcode failed to load"));
      document.head.appendChild(script);
    });

    if (!window.Html5Qrcode || !window.Html5QrcodeSupportedFormats) {
      throw new Error("html5-qrcode is unavailable");
    }

    return {
      Html5Qrcode: window.Html5Qrcode,
      Html5QrcodeSupportedFormats: window.Html5QrcodeSupportedFormats,
    };
  }
}

type Props = {
  onProductFound?: (product: Product, barcode: string) => void;
  onProductNotFound?: (barcode: string) => void;
  onBarcodeScanned?: (barcode: string) => void;
  fps?: number;
  className?: string;
  startLabel?: string;
  stopLabel?: string;
  stopOnProductFound?: boolean;
  stopOnProductNotFound?: boolean;
  duplicateScanDelayMs?: number;
};

export function BarcodeScanner({
  onProductFound,
  onProductNotFound,
  onBarcodeScanned,
  fps = 10,
  className = "",
  startLabel = "Start Scan",
  stopLabel = "Stop Camera",
  stopOnProductFound = true,
  stopOnProductNotFound = false,
  duplicateScanDelayMs = 1500,
}: Props) {
  const reactId = useId();
  const readerId = `barcode-scanner-${reactId.replace(/:/g, "")}`;
  const scannerRef = useRef<Html5QrcodeInstance | null>(null);
  const duplicateScanGuard = useDuplicateScanGuard(duplicateScanDelayMs);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Tekan Start Scan untuk membuka kamera.");
  const [error, setError] = useState("");

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;

    if (!scanner) return;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }

      await scanner.clear();
    } catch (stopError) {
      console.error("Failed to stop barcode scanner:", stopError);
    } finally {
      scannerRef.current = null;
      duplicateScanGuard.reset();
      setScanning(false);
    }
  }, [duplicateScanGuard]);

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  const handleDecoded = useCallback(
    async (decodedText: string, _result: Html5QrcodeResult) => {
      const barcode = decodedText.trim();

      if (!duplicateScanGuard.shouldProcess(barcode)) return;

      onBarcodeScanned?.(barcode);
      setMessage(`Barcode terbaca: ${barcode}`);
      setError("");

      const product = await barcodeService.searchByBarcode(barcode);

      if (product) {
        setMessage(`Produk ditemukan: ${product.name}`);
        onProductFound?.(product, barcode);

        if (stopOnProductFound) {
          await stopScanner();
          return;
        }

        return;
      }

      setError("Product not found.");
      onProductNotFound?.(barcode);

      if (stopOnProductNotFound) {
        await stopScanner();
        return;
      }
    },
    [
      duplicateScanGuard,
      onBarcodeScanned,
      onProductFound,
      onProductNotFound,
      stopOnProductFound,
      stopOnProductNotFound,
      stopScanner,
    ]
  );

  const startScanner = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("Menyiapkan scanner...");

    try {
      await stopScanner();
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await loadHtml5Qrcode();
      setMessage("Meminta izin kamera...");

      const scanner = new Html5Qrcode(readerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
        ],
        verbose: false,
      });

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps,
          qrbox: { width: 320, height: 160 },
          aspectRatio: 1.777778,
        },
        handleDecoded,
        () => undefined
      );

      setScanning(true);
      setMessage("Arahkan kamera ke barcode CODE128, EAN13, atau EAN8 produk.");
    } catch (startError) {
      console.error("Failed to start barcode scanner:", startError);
      setError(
        "Kamera tidak dapat dibuka. Pastikan izin kamera diberikan dan gunakan HTTPS/PWA atau localhost."
      );
      scannerRef.current = null;
      duplicateScanGuard.reset();
      setScanning(false);
    } finally {
      setLoading(false);
    }
  }, [duplicateScanGuard, fps, handleDecoded, readerId, stopScanner]);

  return (
    <section className={`space-y-4 ${className}`}>
      <div
        id={readerId}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 dark:border-slate-800"
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={startScanner}
          disabled={loading || scanning}
          className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900"
        >
          {loading ? "Starting..." : startLabel}
        </button>

        <button
          type="button"
          onClick={() => void stopScanner()}
          disabled={!scanning}
          className="rounded-xl border border-slate-300 px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700"
        >
          {stopLabel}
        </button>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}
    </section>
  );
}
