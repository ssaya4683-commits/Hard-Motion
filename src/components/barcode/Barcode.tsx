import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

type Props = {
  value: string;
  height?: number;
  width?: number;
};

export function Barcode({
  value,
  height = 70,
  width = 2,
}: Props) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || !value) return;

    JsBarcode(ref.current, value, {
      format: "CODE128",
      displayValue: true,
      fontSize: 14,
      height,
      width,
      margin: 8,
    });
  }, [value, height, width]);

  return <svg ref={ref} />;
}