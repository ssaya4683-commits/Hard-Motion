import { useCallback, useEffect, useMemo, useState } from "react";
import { inventoryService, type ProductInput } from "../services/inventoryService";
import type {
  Product,
  Transaction,
  TransactionType,
} from "../types";

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const refresh = useCallback(async () => {
    const products = await inventoryService.getProducts();
    const transactions =
      await inventoryService.getTransactions();

    setProducts(products);
    setTransactions(transactions);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const summary = useMemo(
    () => ({
      totalProducts: products.length,

      totalStock: products.reduce(
        (sum, product) => sum + product.stock,
        0
      ),

      inventoryValue: products.reduce(
        (sum, product) =>
          sum +
          product.purchasePrice *
            product.stock,
        0
      ),

      lowStock: products.filter(
        (product) =>
          product.stock > 0 &&
          product.stock <=
            product.minimumStock
      ).length,
    }),
    [products]
  );

  return {
    products,

    transactions,

    refresh,

    summary,

    saveProduct: async (
      product: ProductInput
    ) => {
      await inventoryService.saveProduct(
        product
      );

      await refresh();
    },

    deleteProduct: async (
      id: number
    ) => {
      await inventoryService.deleteProduct(
        id
      );

      await refresh();
    },

    duplicateProduct: async (
      product: Product
    ) => {
      await inventoryService.duplicateProduct(
        product
      );

      await refresh();
    },

    isSkuDuplicate:
      inventoryService.isSkuDuplicate,

    moveStock: async ({
  product,
  size,
  type,
  quantity,
  note,
}: {
  product: Product;
  size: number;
  type: TransactionType;
  quantity: number;
  note: string;
}) => {
  await inventoryService.moveStock({
    product,
    size,
    type,
    quantity,
    note,
  });

  await refresh();
},

    /*
     * Sprint 2
     */

    getImages:
      inventoryService.getImages,


    getSizes:
      inventoryService.getSizes,

    getTotalStock:
      inventoryService.getTotalStock,
  };
}