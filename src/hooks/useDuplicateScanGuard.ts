import { useCallback, useMemo, useRef } from "react";

type LastScan = {
  barcode: string;
  detectedAt: number;
};

export function useDuplicateScanGuard(delayMs = 1500) {
  const lastScanRef = useRef<LastScan | null>(null);

  const shouldProcess = useCallback(
    (barcode: string) => {
      const value = barcode.trim();

      if (!value) {
        return false;
      }

      const now = Date.now();
      const lastScan = lastScanRef.current;

      if (
        lastScan &&
        lastScan.barcode === value &&
        now - lastScan.detectedAt < delayMs
      ) {
        return false;
      }

      lastScanRef.current = {
        barcode: value,
        detectedAt: now,
      };

      return true;
    },
    [delayMs]
  );

  const reset = useCallback(() => {
    lastScanRef.current = null;
  }, []);

  return useMemo(
    () => ({
      shouldProcess,
      reset,
    }),
    [reset, shouldProcess]
  );
}
