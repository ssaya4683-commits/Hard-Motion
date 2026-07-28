import { useEffect, useRef, useState } from "react";
import {
  exportBackup,
  readBackupFile,
  restoreBackupData,
  getCurrentDatabaseSummary,
getDatabaseSizeEstimate,
  type BackupData,
} from "../../services/backupService";
import { BackupPreviewCard } from "./BackupPreviewCard";

export function BackupSection() {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [backup, setBackup] =
    useState<BackupData | null>(null);

  const [loading, setLoading] =
    useState(false);
    const [summary, setSummary] = useState<Awaited<
  ReturnType<typeof getCurrentDatabaseSummary>
> | null>(null);

const [dbSize, setDbSize] = useState(0);
useEffect(() => {
  async function loadInfo() {
    const info = await getCurrentDatabaseSummary();
    const size = await getDatabaseSizeEstimate();

    setSummary(info);
    setDbSize(size.kilobytes);
  }

  void loadInfo();
}, []);

  const handleChooseFile = async (
    file: File
  ) => {
    try {
      const result =
        await readBackupFile(file);

      setSelectedFile(file);
      setBackup(result);
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "File backup tidak valid."
      );

      setSelectedFile(null);
      setBackup(null);
    }
  };

  const handleRestore = async () => {
    if (!backup) return;

    const ok = confirm(
      "Seluruh data akan diganti menggunakan backup ini. Lanjutkan?"
    );

    if (!ok) return;

    try {
      setLoading(true);

      await restoreBackupData(backup);

      alert(
        "Restore berhasil. Aplikasi akan dimuat ulang."
      );

      location.reload();
    } catch (err) {
      console.error(err);

      alert("Restore gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">

      <h2 className="text-2xl font-bold">
        Backup & Restore
      </h2>

      <p className="mt-1 text-slate-500">
        Simpan cadangan database atau
        pulihkan data dari file backup.
      </p>
      {summary && (
  <div className="mt-5 rounded-xl border p-4">
    <h3 className="font-semibold">
      Informasi Database
    </h3>

    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
      <p>Produk : {summary.products}</p>
      <p>Transaksi : {summary.transactions}</p>
      <p>Images : {summary.productImages}</p>
      <p>Ukuran : {dbSize} KB</p>
      <p>Total Record : {summary.totalRecords}</p>
    </div>
  </div>
)}

      <div className="mt-6 flex flex-wrap gap-3">

        <button
          onClick={exportBackup}
          className="rounded-xl bg-slate-900 px-5 py-2 text-white dark:bg-white dark:text-slate-900"
        >
          Backup Database
        </button>

        <button
          onClick={() =>
            inputRef.current?.click()
          }
          className="rounded-xl border px-5 py-2"
        >
          Pilih File Backup
        </button>

      </div>

      <input
        hidden
        ref={inputRef}
        type="file"
        accept=".json"
        onChange={(e) => {
          const file =
            e.target.files?.[0];

          if (file) {
            void handleChooseFile(file);
          }

          e.currentTarget.value = "";
        }}
      />

      {backup && (
        <>
          <BackupPreviewCard
            backup={backup}
            fileName={selectedFile?.name}
          />

          <div className="mt-5">

            <button
              disabled={loading}
              onClick={handleRestore}
              className="rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white disabled:opacity-50"
            >
              {loading
                ? "Merestore..."
                : "Restore Database"}
            </button>

          </div>
        </>
      )}
    </div>
  );
}