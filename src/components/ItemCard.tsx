import * as styles from './ItemCard.css';
import React from 'react';
// import type { EnrichedAnimal } from '../types/domainTypes';

type ItemCardProps = {
  item: {
    id: string;
    name: string;
    description?: string;
    tags?: string[];
  };
};

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.title}>{item.name}</div>
      <div>{item.description}</div>
      <div className={styles.tags}>
        {item.tags?.map(tag => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </div>
  );
}
