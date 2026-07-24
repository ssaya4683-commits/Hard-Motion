import { useRef } from "react";
import { Card } from "../components/common/Card";
import {
  exportBackup,
  restoreBackup,
} from "../services/backupService";

export function Settings() {
  const fileInput =
    useRef<HTMLInputElement>(null);

  const handleRestore = async (
    file: File
  ) => {
    const ok = confirm(
      "Restore akan mengganti seluruh data yang ada. Lanjutkan?"
    );

    if (!ok) return;

    try {
      await restoreBackup(file);

      alert(
        "Restore berhasil. Aplikasi akan dimuat ulang."
      );

      location.reload();
    } catch (err) {
      console.error(err);

      alert("Restore gagal.");
    }
  };

  return (
    <Card>
      <h1 className="mb-3 text-3xl font-black">
        Pengaturan
      </h1>

      <p className="text-slate-500">
        Atur preferensi aplikasi dan
        lakukan backup maupun restore
        database.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <input
          className="rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"
          defaultValue="Hard Motion Store"
        />

        <input
          className="rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950"
          defaultValue="IDR"
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={exportBackup}
          className="rounded-xl bg-slate-900 px-5 py-2 text-white dark:bg-white dark:text-slate-900"
        >
          Backup Database
        </button>

        <button
          onClick={() =>
            fileInput.current?.click()
          }
          className="rounded-xl border px-5 py-2"
        >
          Restore Database
        </button>

        <input
          ref={fileInput}
          hidden
          type="file"
          accept=".json"
          onChange={(e) => {
            const file =
              e.target.files?.[0];

            if (file) {
              void handleRestore(file);
            }

            e.currentTarget.value = "";
          }}
        />
      </div>
    </Card>
  );
}