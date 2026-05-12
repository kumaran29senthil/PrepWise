"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-gray-400">
          An unexpected error occurred. Please try again.
        </p>
      </div>

      <Button onClick={reset} className="btn-primary">
        Try Again
      </Button>
    </div>
  );
}
