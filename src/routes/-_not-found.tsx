import React from "react";

export const NotFoundComponent = () => {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you requested does not exist.</p>
    </main>
  );
};

export default NotFoundComponent;
