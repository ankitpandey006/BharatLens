import { useState } from "react";

export function useSavedItems<T>() {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  return { items, loading, setItems, setLoading };
}
