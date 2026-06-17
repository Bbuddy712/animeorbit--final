import React from "react";

export const ErrorComponent = ({
  error,
}: {
  error?: unknown;
}) => {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <pre className="mt-4 rounded bg-muted/30 p-3 text-sm overflow-auto">
        {error instanceof Error ? error.message : String(error ?? "Unknown error")}
      </pre>
    </main>
  );
};
