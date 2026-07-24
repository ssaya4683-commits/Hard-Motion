import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface ProductBarcodeProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  className?: string;
}

export default function ProductBarcode({
  value,
  width = 2,
  height = 70,
  displayValue = true,
  className = "",
}: ProductBarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;

    JsBarcode(svgRef.current, value, {
      format: "CODE128",
      lineColor: "#000",
      width,
      height,
      displayValue,
      margin: 10,
      fontSize: 14,
      textMargin: 4,
    });
  }, [value, width, height, displayValue]);

  return (
    <div className={`flex justify-center ${className}`}>
      <svg ref={svgRef} />
    </div>
  );
}