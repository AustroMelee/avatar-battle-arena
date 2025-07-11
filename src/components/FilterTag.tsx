import * as styles from './FilterTag.css';
import React from 'react';

type FilterTagProps = {
  label: string;
  onRemove?: () => void;
};

export default function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <span className={styles.tag}>
      {label}
      {onRemove && (
        <button onClick={onRemove} aria-label={`Remove ${label}`}>×</button>
      )}
    </span>
  );
}
