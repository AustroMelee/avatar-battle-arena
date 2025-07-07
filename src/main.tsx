/*
 * @file main.tsx
 * @description React entry point for the Avatar Battle Arena app. Mounts the root App component and sets up error boundaries and Suspense fallback.
 * @criticality 💎 Foundational
 * @owner AustroMelee
 * @lastUpdated 2025-07-08
 * @related src/App.tsx, src/components/ErrorBoundary.tsx
 */
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import './styles/variables.css';
import './styles/global.css';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback, LoadingSpinner } from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingSpinner />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>
); 