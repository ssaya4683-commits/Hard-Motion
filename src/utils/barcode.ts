export function generateBarcodeValue(
  productCode: string,
  size?: string | number
): string {
  const cleanCode = productCode.replace(/\s+/g, "").toUpperCase();

  if (size !== undefined && size !== null && size !== "") {
    return `${cleanCode}-${size}`;
  }

  return cleanCode;
}