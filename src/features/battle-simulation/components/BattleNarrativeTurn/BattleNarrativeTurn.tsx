import React from 'react';
import styles from './BattleNarrativeTurn.module.css';
import type { LogEventType } from '../../types';

export interface BattleNarrativeTurnProps {
  actor: string;
  narrative: string;
  type: LogEventType;
  playerSide: 'p1' | 'p2' | 'system';
  icon: string; // Path to image asset
}

/**
 * @description Displays a single, clean narrative turn for the user-facing battle log.
 */
export const BattleNarrativeTurn: React.FC<BattleNarrativeTurnProps> = ({ actor, narrative, playerSide, icon }) => {

  const getActorStyle = (charName: string): string => {
    if (playerSide === 'p1') return styles.p1Actor;
    if (playerSide === 'p2') return styles.p2Actor;

    // System and Narrator styles
    switch (charName.toLowerCase()) {
      case 'narrator':
      case 'system':
      case 'environment':
        return styles.system;
      default:
        return styles.default;
    }
  };

  // Don't render if narrative is empty or just whitespace
  if (!narrative || !narrative.trim()) {
    return null;
  }

  return (
    <div className={`${styles.container} ${styles[playerSide]}`}>
      <div className={`${styles.actor} ${getActorStyle(actor)}`}>
        <img src={icon} alt={`${actor} icon`} className={styles.iconImg} />
        <span className={styles.actorName}>{actor}:</span>
      </div>
      <p className={styles.narrativeText}>{narrative}</p>
    </div>
  );
}; 