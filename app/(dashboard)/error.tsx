"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        <RotateCcw className="mr-2 h-3.5 w-3.5" />
        Try again
      </Button>
    </div>
  );
}
