import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import SearchBox from "../../components/search/SearchBox";
import DataTable from "../../components/table/DataTable";
import Modal from "../../components/modal/Modal";
import Button from "../../components/ui/Button";

import ProductForm from "./ProductForm";

import { productService } from "../../database/productService";
import type { Product } from "../../database/db";

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  async function loadProducts() {
    setProducts(await productService.getAll());
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Hapus produk ini?")) return;
    await productService.remove(id);
    await loadProducts();
  }

  const filteredProducts = useMemo(() => {
    const key = search.toLowerCase();
    return products.filter(
      (p) =>
        p.nama.toLowerCase().includes(key) ||
        p.kode.toLowerCase().includes(key) ||
        p.kategori.toLowerCase().includes(key) ||
        p.merek.toLowerCase().includes(key)
    );
  }, [products, search]);

  const columns = [
    { key: "no", title: "No", render: (_: Product, i: number) => i + 1 },
    { key: "kode", title: "Kode" },
    { key: "nama", title: "Nama Produk" },
    { key: "kategori", title: "Kategori" },
    { key: "stok", title: "Stok", align: "center" as const },
    {
      key: "hargaJual",
      title: "Harga Jual",
      align: "right" as const,
      render: (row: Product) => "Rp " + row.hargaJual.toLocaleString("id-ID"),
    },
    {
      key: "aksi",
      title: "Aksi",
      align: "center" as const,
      render: (row: Product) => (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" onClick={() => { setSelectedProduct(row); setOpenModal(true); }}>
            <Pencil size={16} />
          </Button>
          <Button variant="danger" onClick={() => handleDelete(row.id!)}>
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Produk</h1>
            <p className="text-slate-500">Kelola seluruh data produk.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-72">
              <SearchBox value={search} onChange={setSearch} />
            </div>
            <Button onClick={() => { setSelectedProduct(null); setOpenModal(true); }}>
              <Plus size={18} />
              Tambah
            </Button>
          </div>
        </div>

        <DataTable columns={columns} data={filteredProducts} />

        <Modal
          open={openModal}
          title={selectedProduct ? "Edit Produk" : "Tambah Produk"}
          onClose={() => {
            setOpenModal(false);
            setSelectedProduct(null);
          }}
        >
          <ProductForm
            product={selectedProduct}
            onSuccess={() => {
              setOpenModal(false);
              setSelectedProduct(null);
              loadProducts();
            }}
          />
        </Modal>
      </div>
    </AppLayout>
  );
}
