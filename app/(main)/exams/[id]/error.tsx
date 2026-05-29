"use client";

import DetailError from "@/components/details/DetailError";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  return <DetailError error={error} reset={reset} />;
}
