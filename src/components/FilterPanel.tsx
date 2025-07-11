import * as styles from './FilterPanel.css';
import React from 'react';

type FilterPanelProps = {
  children: React.ReactNode;
};

export default function FilterPanel({ children }: FilterPanelProps) {
  return <div className={styles.panel}>{children}</div>;
}
