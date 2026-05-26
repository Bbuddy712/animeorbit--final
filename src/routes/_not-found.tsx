import React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const NotFoundComponent = () => {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you requested does not exist.</p>
    </main>
  );
};

// Keep this lightweight to avoid breaking the build.
// This file should not declare a full path to prevent conflicts with existing routes.
export default NotFoundComponent;


