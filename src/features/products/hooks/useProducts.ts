import { useCallback, useEffect, useMemo, useState } from "react";
import { productService } from "../../../database/productService";
import type { Product } from "../../../database/db";

export default function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoading(true);

    try {
      const data = await productService.getAll();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;

    const keyword = search.toLowerCase();

    return products.filter((item) => {
      return (
        item.kode.toLowerCase().includes(keyword) ||
        item.nama.toLowerCase().includes(keyword) ||
        item.kategori.toLowerCase().includes(keyword) ||
        item.merek.toLowerCase().includes(keyword) ||
        item.barcode.toLowerCase().includes(keyword)
      );
    });
  }, [products, search]);

  async function addProduct(product: Product) {
    await productService.add(product);
    await loadProducts();
  }

  async function updateProduct(
    id: number,
    product: Partial<Product>
  ) {
    await productService.update(id, product);
    await loadProducts();
  }

  async function deleteProduct(id: number) {
    await productService.remove(id);
    await loadProducts();
  }

  const totalProducts = products.length;

  const totalStock = useMemo(() => {
    return products.reduce((total, item) => total + item.stok, 0);
  }, [products]);

  const totalValue = useMemo(() => {
    return products.reduce(
      (total, item) =>
        total + item.stok * item.hargaBeli,
      0
    );
  }, [products]);

  return {
    loading,

    search,
    setSearch,

    products,
    filteredProducts,

    totalProducts,
    totalStock,
    totalValue,

    loadProducts,

    addProduct,
    updateProduct,
    deleteProduct,
  };
}