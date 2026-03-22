import { Header } from "@/components/features/dashboard/Header";

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6">
        <p className="text-slate-500 text-sm">Welcome to MasterMinding. Your dashboard is loading...</p>
      </div>
    </>
  );
}
