interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBox({
  value,
  onChange,
}: SearchBoxProps) {
  return (
    <input
      type="text"
      placeholder="Cari produk..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
    />
  );
}