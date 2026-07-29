import { useLayoutEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

type Props = {
  value: string;
  height?: number;
  width?: number;
  onRendered?: () => void;
};

export function Barcode({
  value,
  height = 70,
  width = 2,
  onRendered,
}: Props) {
  const ref = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    if (!ref.current || !value) return;

    JsBarcode(ref.current, value, {
      format: "CODE128",
      displayValue: true,
      fontSize: 14,
      height,
      width,
      margin: 8,
    });

    onRendered?.();
  }, [value, height, width, onRendered]);

  return <svg ref={ref} />;
}