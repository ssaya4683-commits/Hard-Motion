import Button from "../../components/ui/Button";
import type { Product } from "../../database/db";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow">
        <h3 className="text-lg font-semibold">
          Belum ada produk
        </h3>

        <p className="mt-2 text-slate-500">
          Tambahkan produk pertama Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow">
      <table className="min-w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-4 py-3 text-left">Kode</th>
            <th className="px-4 py-3 text-left">Nama</th>
            <th className="px-4 py-3 text-left">Kategori</th>
            <th className="px-4 py-3 text-center">Stok</th>
            <th className="px-4 py-3 text-right">
              Harga Jual
            </th>
            <th className="px-4 py-3 text-center">
              Aksi
            </th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="border-t hover:bg-slate-50"
            >
              <td className="px-4 py-3">
                {product.kode}
              </td>

              <td className="px-4 py-3 font-medium">
                {product.nama}
              </td>

              <td className="px-4 py-3">
                {product.kategori}
              </td>

              <td className="px-4 py-3 text-center">
                {product.stok}
              </td>

              <td className="px-4 py-3 text-right">
                Rp{" "}
                {product.hargaJual.toLocaleString(
                  "id-ID"
                )}
              </td>

              <td className="px-4 py-3">
                <div className="flex justify-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => onEdit(product)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="danger"
                    onClick={() => onDelete(product)}
                  >
                    Hapus
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}