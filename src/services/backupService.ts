import { saveAs } from "file-saver";
import { db } from "../db/db";

export async function exportBackup() {
  const backup = {
    version: 1,
    createdAt: new Date().toISOString(),

    products: await db.products.toArray(),
    productSizes: await db.productSizes.toArray(),
    productImages: await db.productImages.toArray(),
    transactions: await db.transactions.toArray(),
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    {
      type: "application/json",
    }
  );

  saveAs(
    blob,
    `hard-motion-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`
  );
}

export async function restoreBackup(file: File) {
  const text = await file.text();

  const backup = JSON.parse(text);

  if (
    !backup.products ||
    !backup.productSizes ||
    !backup.productImages ||
    !backup.transactions
  ) {
    throw new Error("File backup tidak valid.");
  }

  await db.transaction(
    "rw",
    db.products,
    db.productSizes,
    db.productImages,
    db.transactions,
    async () => {
      await db.products.clear();
      await db.productSizes.clear();
      await db.productImages.clear();
      await db.transactions.clear();

      if (backup.products.length) {
        await db.products.bulkAdd(backup.products);
      }

      if (backup.productSizes.length) {
        await db.productSizes.bulkAdd(backup.productSizes);
      }

      if (backup.productImages.length) {
        await db.productImages.bulkAdd(backup.productImages);
      }

      if (backup.transactions.length) {
        await db.transactions.bulkAdd(backup.transactions);
      }
    }
  );
}