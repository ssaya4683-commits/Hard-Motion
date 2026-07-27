import { db } from "../db/db";
import type { Setting, SettingKey } from "../types";

const DEFAULT_SETTINGS: Record<SettingKey, string> = {
  storeName: "Hard Motion Store",
  currency: "IDR",
  theme: "system",
  autoBackup: "true",
  storeWhatsapp: "",
};

export async function initializeSettings(): Promise<void> {
  const now = new Date().toISOString();

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    const existing = await db.settings
      .where("key")
      .equals(key as SettingKey)
      .first();

    if (!existing) {
      await db.settings.add({
        key: key as SettingKey,
        value,
        createdAt: now,
      });
    }
  }
}

export async function getSetting(
  key: SettingKey
): Promise<string> {
  const setting = await db.settings
    .where("key")
    .equals(key)
    .first();

  return setting?.value ?? DEFAULT_SETTINGS[key];
}

export async function setSetting(
  key: SettingKey,
  value: string
): Promise<void> {
  const now = new Date().toISOString();

  const existing = await db.settings
    .where("key")
    .equals(key)
    .first();

  if (existing) {
    await db.settings.update(existing.id!, {
      value,
      updatedAt: now,
    });
  } else {
    await db.settings.add({
      key,
      value,
      createdAt: now,
    });
  }
}

export async function getAllSettings(): Promise<Setting[]> {
  return db.settings.toArray();
}
export async function getSettingsObject(): Promise<
  Record<SettingKey, string>
> {
  const settings = await getAllSettings();

  const result = {
    ...DEFAULT_SETTINGS,
  } as Record<SettingKey, string>;

  for (const setting of settings) {
    result[setting.key] = setting.value;
  }

  return result;
}

export async function resetSettings(): Promise<void> {
  await db.settings.clear();
  await initializeSettings();
}