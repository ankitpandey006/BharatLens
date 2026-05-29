export default function AdminTable() {
  const users = [
    { id: 1, name: "Ankit", email: "ankit@gmail.com" },
    { id: 2, name: "Rahul", email: "rahul@gmail.com" },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">ID</th>
            <th className="text-left py-2">Name</th>
            <th className="text-left py-2">Email</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="py-3">{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}