export function normalizeWhatsappNumber(phone: string) {
  return phone
    .replace(/\D/g, "")
    .replace(/^0/, "62");
}

interface OrderMessage {
  phone: string;
  productName: string;
  price: number;
  sizes?: string[];
}

export function createWhatsappLink({
  phone,
  productName,
  price,
  sizes = [],
}: OrderMessage) {
  const number = normalizeWhatsappNumber(phone);

  const sizeText =
    sizes.length > 0
      ? sizes.join(", ")
      : "-";

  const message = `Halo Hard Motion,

Saya tertarik dengan produk berikut:

👟 ${productName}
💰 Rp ${price.toLocaleString("id-ID")}
📏 Ukuran: ${sizeText}

Apakah stoknya masih tersedia?

Terima kasih.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}