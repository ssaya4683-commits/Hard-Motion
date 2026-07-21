import { useCallback, useEffect, useMemo, useState } from "react";
import { inventoryService } from "../services/inventoryService";
import type { Product, StockTransaction, TransactionType } from "../types";

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const refresh = useCallback(async () => { await inventoryService.seed(); setProducts(await inventoryService.getProducts()); setTransactions(await inventoryService.getTransactions()); }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  return {
    products, transactions, refresh,
    summary: useMemo(() => ({ totalProducts: products.length, totalStock: products.reduce((a, p) => a + p.stock, 0), lowStock: products.filter((p) => p.stock <= p.minStock).length }), [products]),
    saveProduct: async (product: Omit<Product, "createdAt" | "updatedAt"> & { id?: number }) => { await inventoryService.saveProduct(product); await refresh(); },
    deleteProduct: async (id: number) => { await inventoryService.deleteProduct(id); await refresh(); },
    moveStock: async (product: Product, type: TransactionType, quantity: number, note: string) => { await inventoryService.moveStock(product, type, quantity, note); await refresh(); },
  };
}
