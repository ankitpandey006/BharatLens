interface EligibilityListProps {
  items: string[];
}

export default function EligibilityList({ items }: EligibilityListProps) {
  if (items.length === 0) {
    return <p>No eligibility details available yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="rounded-lg bg-[#F5F3EE] px-3 py-2">
          {item}
        </li>
      ))}
    </ul>
  );
}
