"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DetailError({ error, reset }: DetailErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="min-h-[70vh] bg-[#F5F3EE] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="space-y-3 pt-6 text-center">
            <h1 className="text-2xl font-bold text-[#1A3C6E]">Unable to load details</h1>
            <p className="text-sm text-[#111827]/75">
              Something went wrong while loading this page. Please try again.
            </p>
            <div className="pt-2">
              <Button onClick={reset}>Try again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
