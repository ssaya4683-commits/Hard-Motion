import { useEffect, useState } from "react";

import { Card } from "../components/common/Card";
import { BackupSection } from "../components/settings/BackupSection";

import {
  getSettingsObject,
  setSetting,
} from "../services/settingsService";

export function Settings() {
  const [loading, setLoading] = useState(true);

  const [storeName, setStoreName] = useState("");
  const [currency, setCurrency] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const settings = await getSettingsObject();

      setStoreName(settings.storeName);
      setCurrency(settings.currency);

      setLoading(false);
    }

    loadSettings();
  }, []);

  async function handleStoreNameBlur() {
    await setSetting("storeName", storeName);
  }

  async function handleCurrencyBlur() {
    await setSetting("currency", currency);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-slate-500">
          Memuat pengaturan...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <h1 className="text-3xl font-black">
          Pengaturan
        </h1>

        <p className="mt-2 text-slate-500">
          Kelola informasi toko dan pengaturan aplikasi Hard Motion.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Nama Toko
            </label>

            <input
              className="w-full rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              onBlur={handleStoreNameBlur}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Mata Uang
            </label>

            <input
              className="w-full rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              onBlur={handleCurrencyBlur}
            />
          </div>
        </div>
      </Card>

      <Card>
        <BackupSection />
      </Card>

      <Card>
        <h2 className="text-xl font-bold">
          Tentang Aplikasi
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4 dark:border-slate-700">
            <p className="text-sm text-slate-500">
              Nama Aplikasi
            </p>

            <p className="mt-1 font-semibold">
              Hard Motion
            </p>
          </div>

          <div className="rounded-xl border p-4 dark:border-slate-700">
            <p className="text-sm text-slate-500">
              Versi
            </p>

            <p className="mt-1 font-semibold">
              1.0.0
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}