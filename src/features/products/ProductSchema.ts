import { z } from "zod";

export const productSchema = z.object({
  kode: z
    .string()
    .trim()
    .min(1, "Kode produk wajib diisi"),

  barcode: z.string(),

  nama: z
    .string()
    .trim()
    .min(1, "Nama produk wajib diisi"),

  kategori: z.string(),

  merek: z.string(),

  warna: z.string(),

  ukuran: z.string(),

  deskripsi: z.string().optional(),

  foto: z.string().optional(),

  hargaBeli: z
    .number({
      invalid_type_error: "Harga beli harus berupa angka",
    })
    .min(0, "Harga beli tidak boleh kurang dari 0"),

  hargaJual: z
    .number({
      invalid_type_error: "Harga jual harus berupa angka",
    })
    .min(0, "Harga jual tidak boleh kurang dari 0"),

  stok: z
    .number({
      invalid_type_error: "Stok harus berupa angka",
    })
    .min(0, "Stok tidak boleh kurang dari 0"),

  stokMinimum: z
    .number({
      invalid_type_error: "Stok minimum harus berupa angka",
    })
    .min(0, "Stok minimum tidak boleh kurang dari 0"),
});

export type ProductFormValues = z.infer<typeof productSchema>;