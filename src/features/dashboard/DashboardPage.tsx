import AppLayout from "../../components/layout/AppLayout";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-slate-500 mt-2">
          Selamat datang di Hard Motion.
        </p>
      </div>
    </AppLayout>
  );
}