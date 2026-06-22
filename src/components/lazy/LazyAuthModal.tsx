import React, { Suspense } from 'react';

// Lazy loaded version of AuthModal
const AuthModal = React.lazy(() =>
  import('../AuthModal').then((module) => ({
    default: module.AuthModal,
  }))
);

/**
 * Lazy-loaded AuthModal with Suspense boundary.
 * Only loads when the auth modal is triggered.
 */
export function LazyAuthModal(props: any) {
  return (
    <Suspense fallback={null}>
      <AuthModal {...props} />
    </Suspense>
  );
}
