export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...(options ?? {}),
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}
