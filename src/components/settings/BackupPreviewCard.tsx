import { Card } from "../common/Card";
import { getBackupSummary } from "../../services/backupService";
import type { BackupData } from "../../services/backupService";

type Props = {
  backup: BackupData;
  fileName?: string;
};

export function BackupPreviewCard({
  backup,
  fileName,
}: Props) {
  const summary = getBackupSummary(backup);

  return (
    <Card className="mt-6">
      <h2 className="text-xl font-bold">
        Preview Backup
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Pastikan file backup yang dipilih sudah benar sebelum melakukan restore.
      </p>

      {fileName && (
        <div className="mt-5">
          <p className="text-sm text-slate-500">
            Nama File
          </p>

          <p className="font-medium break-all">
            {fileName}
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">

        <Info
          title="Aplikasi"
          value={summary.appName}
        />

        <Info
          title="Versi Aplikasi"
          value={summary.appVersion}
        />

        <Info
          title="Versi Database"
          value={`v${summary.dbVersion}`}
        />

        <Info
          title="Tanggal Backup"
          value={new Date(
            summary.createdAt
          ).toLocaleString("id-ID")}
        />

        <Info
          title="Produk"
          value={summary.products}
        />

        <Info
          title="Varian Ukuran"
          value={summary.productSizes}
        />

        <Info
          title="Foto Produk"
          value={summary.productImages}
        />

        <Info
          title="Transaksi"
          value={summary.transactions}
        />

      </div>
    </Card>
  );
}

type InfoProps = {
  title: string;
  value: React.ReactNode;
};

function Info({
  title,
  value,
}: InfoProps) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-lg font-bold">
        {value}
      </p>
    </div>
  );
}