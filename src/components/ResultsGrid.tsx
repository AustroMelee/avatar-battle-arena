import * as styles from './ResultsGrid.css';
import React from 'react';
import ItemCard from './ItemCard';

type ResultsGridProps = {
  items: Array<{
    id: string;
    name: string;
    description?: string;
    tags?: string[];
  }>;
};

export default function ResultsGrid({ items }: ResultsGridProps) {
  return (
    <div className={styles.grid}>
      {items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
