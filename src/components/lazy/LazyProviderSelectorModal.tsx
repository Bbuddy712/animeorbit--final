import React, { Suspense } from 'react';
import type { ProviderSelectorModalProps } from '../ProviderSelectorModal';

// Lazy loaded version of ProviderSelectorModal
const ProviderSelectorModal = React.lazy(() =>
  import('../ProviderSelectorModal').then((module) => ({
    default: module.ProviderSelectorModal,
  }))
);

/**
 * Lazy-loaded ProviderSelectorModal with Suspense boundary.
 * Only loads the modal code when it is actually opened.
 */
export function LazyProviderSelectorModal(props: ProviderSelectorModalProps) {
  return (
    <Suspense fallback={null}>
      <ProviderSelectorModal {...props} />
    </Suspense>
  );
}
