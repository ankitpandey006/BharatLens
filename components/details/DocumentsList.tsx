interface DocumentsListProps {
  items: string[];
}

export default function DocumentsList({ items }: DocumentsListProps) {
  if (items.length === 0) {
    return <p>No document requirements listed yet.</p>;
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
