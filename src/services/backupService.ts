import { saveAs } from "file-saver";
import { db } from "../db/db";

export type BackupData = {
  version: number;
  createdAt: string;
  products: unknown[];
  productSizes: unknown[];
  productImages: unknown[];
  transactions: unknown[];
};

export async function createBackup(): Promise<BackupData> {
  return {
    version: 1,
    createdAt: new Date().toISOString(),

    products: await db.products.toArray(),
    productSizes: await db.productSizes.toArray(),
    productImages: await db.productImages.toArray(),
    transactions: await db.transactions.toArray(),
  };
}

export async function exportBackup() {
  const backup = await createBackup();

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

/*
|--------------------------------------------------------------------------
| AUTO BACKUP
|--------------------------------------------------------------------------
*/

const AUTO_BACKUP_KEY = "hard-motion-auto-backup";

export async function createAutoBackup() {
  const backup = await createBackup();

  localStorage.setItem(
    AUTO_BACKUP_KEY,
    JSON.stringify(backup)
  );
}

export function getAutoBackup(): BackupData | null {
  const raw = localStorage.getItem(AUTO_BACKUP_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAutoBackup() {
  localStorage.removeItem(AUTO_BACKUP_KEY);
}