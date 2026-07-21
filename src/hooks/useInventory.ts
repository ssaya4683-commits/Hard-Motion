import { useCallback, useEffect, useMemo, useState } from "react";
import { inventoryService, type ProductInput } from "../services/inventoryService";
import type { Product, StockTransaction, TransactionType } from "../types";

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const refresh = useCallback(async () => {
    setProducts(await inventoryService.getProducts());
    setTransactions(await inventoryService.getTransactions());
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  return {
    products, transactions, refresh,
    summary: useMemo(() => ({
      totalProducts: products.length,
      totalStock: products.reduce((a, p) => a + p.stock, 0),
      inventoryValue: products.reduce((a, p) => a + (p.purchasePrice * p.stock), 0),
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= p.minimumStock).length,
    }), [products]),
    saveProduct: async (product: ProductInput) => { await inventoryService.saveProduct(product); await refresh(); },
    deleteProduct: async (id: number) => { await inventoryService.deleteProduct(id); await refresh(); },
    duplicateProduct: async (product: Product) => { await inventoryService.duplicateProduct(product); await refresh(); },
    isSkuDuplicate: inventoryService.isSkuDuplicate,
    moveStock: async (product: Product, type: TransactionType, quantity: number, note: string) => { await inventoryService.moveStock(product, type, quantity, note); await refresh(); },
  };
}
