import React from 'react';

/*
 * @file ErrorBoundary.tsx
 * @description Global error boundary for React. Catches and displays errors in the UI tree.
 * @criticality 🩸 Error Handling
 * @owner AustroMelee
 * @lastUpdated 2025-07-08
 * @related App.tsx, main.tsx
 */

/**
 * @description Error fallback component for error boundaries
 * @returns {React.JSX.Element} Error display UI
 */
export function ErrorFallback(): React.JSX.Element {
  return (
    <div role="alert" style={{ padding: 32, color: 'red', textAlign: 'center' }}>
      <h2>Something went wrong.</h2>
      <p>Please refresh the page or contact support.</p>
    </div>
  );
}

/**
 * @description Loading spinner component for Suspense fallback
 * @returns {React.JSX.Element} Loading display UI
 */
export function LoadingSpinner(): React.JSX.Element {
  return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <span>Loading...</span>
    </div>
  );
} 