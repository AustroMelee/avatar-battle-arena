import * as styles from './ErrorBoundary.css';
import React from 'react';

type ErrorBoundaryProps = {
  error?: Error;
  children?: React.ReactNode;
};

export default function ErrorBoundary({ error, children }: ErrorBoundaryProps) {
  if (error) {
    return <div className={styles.errorBox}>Something went wrong: {error.message}</div>;
  }
  return <>{children}</>;
}
