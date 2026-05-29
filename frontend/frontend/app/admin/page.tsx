import StatCard from "@/components/admin/StatCard";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A3C6E] mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value="1,245" />
        <StatCard title="Verified Sources" value="87" />
        <StatCard title="Pending Updates" value="12" />
      </div>
    </div>
  );
}