import { useRef, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import {
  downloadProductImportTemplate,
  importPreviewRows,
  readProductImportFile,
  type DuplicateMode,
  type ImportPreviewRow,
  type ImportResult,
} from "../services/importExcelService";

export function ImportProducts() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ImportPreviewRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState<DuplicateMode>("skip");
  const [progress, setProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult>();

  const blockingErrors = rows.reduce(
    (total, row) =>
      total + row.errors.filter((error) => !error.includes("sudah ada di database")).length,
    0
  );
  const databaseDuplicates = rows.filter((row) => row.existingProduct).length;

  async function handleFile(file?: File) {
    if (!file) return;

    try {
      setResult(undefined);
      setProgress(0);
      setFileName(file.name);
      const preview = await readProductImportFile(file);
      setRows(preview);
      toast.success("Preview import berhasil dibuat.");
    } catch (error) {
      setRows([]);
      setFileName("");
      toast.error(error instanceof Error ? error.message : "Gagal membaca file Excel.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleImport() {
    setImporting(true);
    setResult(undefined);
    setProgress(0);

    try {
      const nextResult = await importPreviewRows(rows, mode, setProgress);
      setResult(nextResult);
      toast.success("Import produk selesai.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import produk gagal.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black">Import Produk</h1>
          <p className="text-slate-500">Import produk dari file Excel .xlsx atau .xls.</p>
        </div>

        <Button variant="secondary" onClick={downloadProductImportTemplate}>
          Download Template Excel
        </Button>
      </div>

      <Card className="space-y-5 p-5">
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
          <FileSpreadsheet className="mx-auto mb-3 text-emerald-600" size={42} />
          <p className="font-semibold">Pilih file Excel produk</p>
          <p className="text-sm text-slate-500">Kolom wajib: Kode, Nama, Kategori, Ukuran, Warna, Harga Beli, Harga Jual, Stok, Stok Minimum.</p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <Button className="mt-4" onClick={() => inputRef.current?.click()}>
            <span className="inline-flex items-center gap-2"><Upload size={18} /> Pilih File</span>
          </Button>
          {fileName && <p className="mt-3 text-sm text-slate-500">File: {fileName}</p>}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <SummaryCard label="Baris Preview" value={rows.length} />
          <SummaryCard label="Error Validasi" value={blockingErrors} danger={blockingErrors > 0} />
          <SummaryCard label="Duplikat Database" value={databaseDuplicates} warning={databaseDuplicates > 0} />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked={mode === "skip"} onChange={() => setMode("skip")} />
            Skip duplicate
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked={mode === "update"} onChange={() => setMode("update")} />
            Update existing
          </label>
          <Button disabled={!rows.length || blockingErrors > 0 || importing} onClick={() => void handleImport()}>
            Import Produk
          </Button>
        </div>

        {importing && <Progress value={progress} />}

        {result && (
          <div className="grid gap-3 md:grid-cols-3">
            <ResultCard icon={<CheckCircle2 size={20} />} label="Berhasil" value={result.success} />
            <ResultCard icon={<CheckCircle2 size={20} />} label="Diperbarui" value={result.updated} />
            <ResultCard icon={<AlertCircle size={20} />} label="Gagal" value={result.failed} />
          </div>
        )}
      </Card>

      {rows.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left dark:bg-slate-800">
                <tr>{["Status", "Kode", "Nama", "Kategori", "Ukuran", "Warna", "Harga Beli", "Harga Jual", "Stok", "Stok Minimum", "Validasi"].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.rowNumber} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-4 py-3">{row.errors.length ? "Periksa" : "Valid"}</td>
                    <td className="px-4 py-3 font-medium">{row.kode}</td>
                    <td className="px-4 py-3">{row.nama}</td>
                    <td className="px-4 py-3">{row.kategori}</td>
                    <td className="px-4 py-3">{row.ukuran}</td>
                    <td className="px-4 py-3">{row.warna}</td>
                    <td className="px-4 py-3">{row.hargaBeli}</td>
                    <td className="px-4 py-3">{row.hargaJual}</td>
                    <td className="px-4 py-3">{row.stok}</td>
                    <td className="px-4 py-3">{row.stokMinimum}</td>
                    <td className="px-4 py-3 text-xs text-red-600 dark:text-red-400">{row.errors.join("; ") || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function SummaryCard({ label, value, danger, warning }: { label: string; value: number; danger?: boolean; warning?: boolean }) {
  return <div className={`rounded-xl border p-4 ${danger ? "border-red-300 bg-red-50 text-red-700" : warning ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 dark:border-slate-800"}`}><p className="text-sm">{label}</p><p className="text-2xl font-black">{value}</p></div>;
}

function ResultCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">{icon}<div><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-black">{value}</p></div></div>;
}

function Progress({ value }: { value: number }) {
  return <div><div className="mb-2 flex justify-between text-sm"><span>Progress import</span><span>{value}%</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full bg-emerald-600 transition-all" style={{ width: `${value}%` }} /></div></div>;
}
