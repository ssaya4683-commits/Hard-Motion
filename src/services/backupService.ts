import { saveAs } from "file-saver";
import { db } from "../db/db";

const APP_NAME = "Hard Motion";
const APP_VERSION = "1.0.0";
const DB_VERSION = 5;

export interface BackupData {
  appName: string;
  appVersion: string;
  dbVersion: number;
  createdAt: string;

  products: unknown[];
  productSizes: unknown[];
  productImages: unknown[];
  transactions: unknown[];

  settings?: unknown[];
}

export interface BackupSummary {
  appName: string;
  appVersion: string;
  dbVersion: number;
  createdAt: string;

  products: number;
  productSizes: number;
  productImages: number;
  transactions: number;

  settings: number;
}

export async function createBackup(): Promise<BackupData> {
  return {
    appName: APP_NAME,
    appVersion: APP_VERSION,
    dbVersion: DB_VERSION,
    createdAt: new Date().toISOString(),

    products: await db.products.toArray(),
    productSizes: await db.productSizes.toArray(),
    productImages: await db.productImages.toArray(),
    transactions: await db.transactions.toArray(),
    settings: await db.settings.toArray(),
  };
}

export function isValidBackup(
  data: unknown
): data is BackupData {
  if (!data || typeof data !== "object") {
    return false;
  }

  const backup = data as Partial<BackupData>;

  return (
    backup.appName === APP_NAME &&
    typeof backup.appVersion === "string" &&
    typeof backup.dbVersion === "number" &&
    typeof backup.createdAt === "string" &&
    Array.isArray(backup.products) &&
    Array.isArray(backup.productSizes) &&
    Array.isArray(backup.productImages) &&
    Array.isArray(backup.transactions) &&
(
  backup.settings === undefined ||
  Array.isArray(backup.settings)
)
  );
}

export async function readBackupFile(
  file: File
): Promise<BackupData> {
  const text = await file.text();

  let backup: unknown;

  try {
    backup = JSON.parse(text);
  } catch {
    throw new Error("File bukan JSON yang valid.");
  }

  if (!isValidBackup(backup)) {
    throw new Error(
      "File backup Hard Motion tidak valid."
    );
  }

  return backup;
}

export function getBackupSummary(
  backup: BackupData
): BackupSummary {
  return {
    appName: backup.appName,
    appVersion: backup.appVersion,
    dbVersion: backup.dbVersion,
    createdAt: backup.createdAt,

    products: backup.products.length,
    productSizes: backup.productSizes.length,
    productImages: backup.productImages.length,
    transactions: backup.transactions.length,
    settings: backup.settings?.length ?? 0,
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

  const now = new Date();

  const filename =
    "HardMotion_Backup_" +
    now
      .toISOString()
      .replace(/:/g, "-")
      .replace("T", "_")
      .slice(0, 16) +
    ".json";

  saveAs(blob, filename);
}

export async function restoreBackupData(
  backup: BackupData
) {
  await db.transaction(
  "rw",
  db.products,
  db.productSizes,
  db.productImages,
  db.transactions,
  db.settings,
    async () => {
      await db.products.clear();
      await db.productSizes.clear();
      await db.productImages.clear();
      await db.transactions.clear();
      await db.settings.clear();

      if (backup.products.length) {
        await db.products.bulkPut(
          backup.products as never[]
        );
      }

      if (backup.productSizes.length) {
        await db.productSizes.bulkPut(
          backup.productSizes as never[]
        );
      }

      if (backup.productImages.length) {
        await db.productImages.bulkPut(
          backup.productImages as never[]
        );
      }

      if (backup.transactions.length) {
        await db.transactions.bulkPut(
          backup.transactions as never[]
        );
      }
      if (backup.settings?.length) {
  await db.settings.bulkPut(
    backup.settings as never[]
  );
}
    }
  );
}

export async function restoreBackup(
  file: File
) {
  const backup = await readBackupFile(file);

  await restoreBackupData(backup);
}

/*
|--------------------------------------------------------------------------
| AUTO BACKUP
|--------------------------------------------------------------------------
*/

const AUTO_BACKUP_KEY =
  "hard-motion-auto-backup";

export async function createAutoBackup() {
  const backup = await createBackup();

  localStorage.setItem(
    AUTO_BACKUP_KEY,
    JSON.stringify(backup)
  );
}

export function getAutoBackup():
  | BackupData
  | null {
  const raw =
    localStorage.getItem(AUTO_BACKUP_KEY);

  if (!raw) return null;

  try {
    const backup = JSON.parse(raw);

    if (!isValidBackup(backup)) {
      return null;
    }

    return backup;
  } catch {
    return null;
  }
  
}

export function clearAutoBackup() {
  localStorage.removeItem(
    AUTO_BACKUP_KEY
  );
}
