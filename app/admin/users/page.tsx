import AdminTable from "@/components/admin/AdminTable";

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A3C6E] mb-6">
        Manage Users
      </h1>

      <AdminTable />
    </div>
  );
}