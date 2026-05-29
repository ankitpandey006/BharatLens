export default function AdminTable() {
  const users = [
    { id: 1, name: "Ankit", email: "ankit@gmail.com" },
    { id: 2, name: "Rahul", email: "rahul@gmail.com" },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F5F3EE]">
            <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A3C6E]">ID</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A3C6E]">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A3C6E]">Email</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#E5E7EB]">
          {users.map((user) => (
            <tr key={user.id} className="transition hover:bg-[#F5F3EE]/50">
              <td className="px-6 py-4 text-sm text-[#111827]">{user.id}</td>
              <td className="px-6 py-4 text-sm text-[#111827]">{user.name}</td>
              <td className="px-6 py-4 text-sm text-[#111827]/75">{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}