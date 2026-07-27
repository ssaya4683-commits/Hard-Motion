import { db } from "../db/db";

const APP_NAME = "Hard Motion";
const APP_VERSION = "1.0.0";
const DB_VERSION = 5;
const BACKUP_VERSION = "2.0";

export interface BackupData {
  /**
   * Metadata
   */
  appName: string;
  appVersion: string;
  dbVersion: number;
  version: string;
  createdAt: string;

  /**
   * Database
   */
  products: unknown[];
  transactions: unknown[];
  productImages: unknown[];
  productSizes: unknown[];
  settings: unknown[];
}

export interface BackupSummary {
  appName: string;
  appVersion: string;
  dbVersion: number;

  version: string;
  createdAt: string;

  products: number;
  transactions: number;
  productImages: number;
  productSizes: number;
  settings: number;

  totalRecords: number;
}

export interface AutoBackupOptions {
  force?: boolean;
}

const AUTO_BACKUP_KEY =
  "hard-motion-auto-backup";

const AUTO_BACKUP_TIME_KEY =
  "hard-motion-auto-backup-time";

/**
 * Maksimal satu auto backup setiap 5 menit
 */
const AUTO_BACKUP_INTERVAL =
  5 * 60 * 1000;

function now() {
  return new Date().toISOString();
}

function pad(number: number) {
  return number
    .toString()
    .padStart(2, "0");
}

function createFileName() {
  const date = new Date();

  return (
    "hard-motion-backup-" +
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    "-" +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds()) +
    ".json"
  );
}
function isObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function isArray(
  value: unknown
): value is unknown[] {
  return Array.isArray(value);
}

export function validateBackup(
  data: unknown
): asserts data is BackupData {
  if (!isObject(data)) {
    throw new Error(
      "Format backup tidak valid."
    );
  }

  const backup: Partial<BackupData> =
  data;

  if (backup.appName !== APP_NAME) {
    throw new Error(
      "File backup bukan berasal dari Hard Motion."
    );
  }

  if (
    typeof backup.appVersion !==
    "string"
  ) {
    throw new Error(
      "Versi aplikasi tidak valid."
    );
  }

  if (
    typeof backup.version !==
    "string"
  ) {
    throw new Error(
      "Versi backup tidak valid."
    );
  }

  if (
    typeof backup.createdAt !==
    "string"
  ) {
    throw new Error(
      "Tanggal backup tidak valid."
    );
  }

  if (!isArray(backup.products)) {
    throw new Error(
      "Data products rusak."
    );
  }

  if (
    !isArray(
      backup.transactions
    )
  ) {
    throw new Error(
      "Data transactions rusak."
    );
  }

  if (
    !isArray(
      backup.productImages
    )
  ) {
    throw new Error(
      "Data productImages rusak."
    );
  }

  if (
    !isArray(
      backup.productSizes
    )
  ) {
    throw new Error(
      "Data productSizes rusak."
    );
  }

  if (!isArray(backup.settings)) {
    throw new Error(
      "Data settings rusak."
    );
  }
}

export function isBackupData(
  data: unknown
): data is BackupData {
  try {
    validateBackup(data);

    return true;
  } catch {
    return false;
  }
}

async function createBackup(): Promise<BackupData> {
  const [
    products,
    transactions,
    productImages,
    productSizes,
    settings,
  ] = await Promise.all([
    db.products.toArray(),
    db.transactions.toArray(),
    db.productImages.toArray(),
    db.productSizes.toArray(),
    db.settings.toArray(),
  ]);

  return {
    appName: APP_NAME,
    appVersion: APP_VERSION,
    dbVersion: DB_VERSION,
    version: BACKUP_VERSION,
    createdAt: now(),

    products,
    transactions,
    productImages,
    productSizes,
    settings,
  };
}

function getTotalRecords(
  backup: BackupData
) {
  return (
    backup.products.length +
    backup.transactions.length +
    backup.productImages.length +
    backup.productSizes.length +
    backup.settings.length
  );
}
export async function exportBackup() {
  const backup = await createBackup();

  const json = JSON.stringify(
    backup,
    null,
    2
  );

  const blob = new Blob(
    [json],
    {
      type: "application/json",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download =
    createFileName();

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  URL.revokeObjectURL(url);
}

export async function createAutoBackup(
  options: AutoBackupOptions = {}
) {
  const lastBackup =
    Number(
      localStorage.getItem(
        AUTO_BACKUP_TIME_KEY
      ) ?? "0"
    );

  const current =
    Date.now();

  if (
    !options.force &&
    current - lastBackup <
      AUTO_BACKUP_INTERVAL
  ) {
    return;
  }

  const backup =
    await createBackup();

  localStorage.setItem(
    AUTO_BACKUP_KEY,
    JSON.stringify(backup)
  );

  localStorage.setItem(
    AUTO_BACKUP_TIME_KEY,
    String(current)
  );
}

export function getAutoBackup() {
  const raw =
    localStorage.getItem(
      AUTO_BACKUP_KEY
    );

  if (!raw) {
    return null;
  }

  try {
    const backup =
      JSON.parse(raw);

    validateBackup(backup);

    return backup;
  } catch {
    return null;
  }
}

export function clearAutoBackup() {
  localStorage.removeItem(
    AUTO_BACKUP_KEY
  );

  localStorage.removeItem(
    AUTO_BACKUP_TIME_KEY
  );
}
export async function readBackupFile(
  file: File
): Promise<BackupData> {
  if (!file.name.endsWith(".json")) {
    throw new Error(
      "File harus berformat JSON."
    );
  }

  const text = await file.text();

  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(
      "File JSON tidak dapat dibaca."
    );
  }

  validateBackup(parsed);

  if (
    parsed.version !==
    BACKUP_VERSION
  ) {
    console.warn(
      `Backup dibuat dengan versi ${parsed.version}.`
    );
  }

  if (
    parsed.dbVersion >
    DB_VERSION
  ) {
    throw new Error(
      "Backup berasal dari versi database yang lebih baru dan tidak dapat dipulihkan."
    );
  }

  return parsed;
}

export async function importBackup(
  file: File
) {
  return readBackupFile(file);
}

export async function verifyBackupFile(
  file: File
) {
  const backup =
    await readBackupFile(file);

  return {
    valid: true,

    version:
      backup.version,

    appVersion:
      backup.appVersion,

    dbVersion:
      backup.dbVersion,

    createdAt:
      backup.createdAt,

    totalRecords:
      getTotalRecords(
        backup
      ),
  };
}

export function isCompatibleBackup(
  backup: BackupData
) {
  return (
    backup.appName ===
      APP_NAME &&
    backup.dbVersion <=
      DB_VERSION
  );
}
export async function restoreBackupData(
  backup: BackupData
) {
  validateBackup(backup);

  await db.transaction(
    "rw",
    db.products,
    db.transactions,
    db.productImages,
    db.productSizes,
    db.settings,
    async () => {
      /**
       * Bersihkan seluruh tabel
       */
      await db.products.clear();

      await db.transactions.clear();

      await db.productImages.clear();

      await db.productSizes.clear();

      await db.settings.clear();

      /**
       * Restore Products
       */
      if (backup.products.length) {
        await db.products.bulkAdd(
          backup.products as any[]
        );
      }

      /**
       * Restore Transactions
       */
      if (
        backup.transactions.length
      ) {
        await db.transactions.bulkAdd(
          backup.transactions as any[]
        );
      }

      /**
       * Restore Product Images
       */
      if (
        backup.productImages.length
      ) {
        await db.productImages.bulkAdd(
          backup.productImages as any[]
        );
      }

      /**
       * Restore Product Sizes
       */
      if (
        backup.productSizes.length
      ) {
        await db.productSizes.bulkAdd(
          backup.productSizes as any[]
        );
      }

      /**
       * Restore Settings
       */
      if (backup.settings.length) {
        await db.settings.bulkAdd(
          backup.settings as any[]
        );
      }
    }
  );

  /**
   * Perbarui Auto Backup
   * agar sinkron dengan hasil restore
   */
  localStorage.setItem(
    AUTO_BACKUP_KEY,
    JSON.stringify(backup)
  );

  localStorage.setItem(
    AUTO_BACKUP_TIME_KEY,
    String(Date.now())
  );
}

export async function clearDatabase() {
  await db.transaction(
    "rw",
    db.products,
    db.transactions,
    db.productImages,
    db.productSizes,
    db.settings,
    async () => {
      await db.products.clear();

      await db.transactions.clear();

      await db.productImages.clear();

      await db.productSizes.clear();

      await db.settings.clear();
    }
  );
}

export async function resetDatabase() {
  await clearDatabase();

  clearAutoBackup();
}
export function getBackupSummary(
  backup: BackupData
): BackupSummary {
  validateBackup(backup);

  return {
    appName: backup.appName,
    appVersion: backup.appVersion,
    dbVersion: backup.dbVersion,

    version: backup.version,
    createdAt: backup.createdAt,

    products:
      backup.products.length,

    transactions:
      backup.transactions.length,

    productImages:
      backup.productImages.length,

    productSizes:
      backup.productSizes.length,

    settings:
      backup.settings.length,

    totalRecords:
      getTotalRecords(
        backup
      ),
  };
}

export async function getCurrentDatabaseSummary(): Promise<BackupSummary> {
  const backup =
    await createBackup();

  return getBackupSummary(
    backup
  );
}

export async function getDatabaseRecordCount() {
  const [
    products,
    transactions,
    productImages,
    productSizes,
    settings,
  ] = await Promise.all([
    db.products.count(),
    db.transactions.count(),
    db.productImages.count(),
    db.productSizes.count(),
    db.settings.count(),
  ]);

  const totalRecords =
    products +
    transactions +
    productImages +
    productSizes +
    settings;

  return {
    products,
    transactions,
    productImages,
    productSizes,
    settings,
    totalRecords,
  };
}

export async function getDatabaseSizeEstimate() {
  const backup =
    await createBackup();

  const json =
    JSON.stringify(backup);

  const bytes =
    new Blob([json]).size;

  return {
    bytes,

    kilobytes:
      Number(
        (
          bytes / 1024
        ).toFixed(2)
      ),

    megabytes:
      Number(
        (
          bytes /
          1024 /
          1024
        ).toFixed(2)
      ),
  };
}
export function hasAutoBackup() {
  return Boolean(
    localStorage.getItem(
      AUTO_BACKUP_KEY
    )
  );
}

export async function restoreAutoBackup() {
  const backup =
    getAutoBackup();

  if (!backup) {
    throw new Error(
      "Auto Backup tidak ditemukan."
    );
  }

  await restoreBackupData(
    backup
  );

  return backup;
}

export async function downloadAutoBackup() {
  const backup =
    getAutoBackup();

  if (!backup) {
    throw new Error(
      "Auto Backup tidak tersedia."
    );
  }

  const json =
    JSON.stringify(
      backup,
      null,
      2
    );

  const blob = new Blob(
    [json],
    {
      type: "application/json",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    "hard-motion-auto-backup.json";

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  URL.revokeObjectURL(
    url
  );
}

export function deleteAutoBackup() {
  clearAutoBackup();
}

export async function refreshAutoBackup() {
  await createAutoBackup({
    force: true,
  });
}

export async function syncAutoBackup() {
  if (
    !hasAutoBackup()
  ) {
    await createAutoBackup({
      force: true,
    });

    return;
  }

  const current =
    await createBackup();

  localStorage.setItem(
    AUTO_BACKUP_KEY,
    JSON.stringify(
      current
    )
  );

  localStorage.setItem(
    AUTO_BACKUP_TIME_KEY,
    String(Date.now())
  );
}
export function getBackupInfo(
  backup: BackupData
) {
  const summary =
    getBackupSummary(
      backup
    );

  return {
    ...summary,

    backupVersion:
      backup.version,

    generatedAt:
      backup.createdAt,

    compatible:
      isCompatibleBackup(
        backup
      ),
  };
}

export function checkBackupIntegrity(
  backup: BackupData
) {
  try {
    validateBackup(
      backup
    );

    return {
      valid: true,

      message:
        "Backup valid.",

      summary:
        getBackupSummary(
          backup
        ),
    };
  } catch (error) {
    return {
      valid: false,

      message:
        error instanceof Error
          ? error.message
          : "Backup rusak.",

      summary: null,
    };
  }
}

export async function exportBackupString() {
  const backup =
    await createBackup();

  return JSON.stringify(
    backup,
    null,
    2
  );
}

export async function importBackupString(
  json: string
) {
  const parsed =
    JSON.parse(json);

  validateBackup(
    parsed
  );

  await restoreBackupData(
    parsed
  );

  return parsed;
}

export async function backupExists() {
  return (
    await db.products.count()
  ) > 0;
}

export {
  APP_NAME,
  APP_VERSION,
  DB_VERSION,
  BACKUP_VERSION,
};