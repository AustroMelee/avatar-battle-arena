import React from 'react';
import styles from './NarrativeBubble.module.css';

export interface NarrativeBubbleProps {
  character: string;
  mainLine: string;
  move?: string;
  chi?: number;
  isCritical?: boolean;
  isDesperation?: boolean;
  isEscalation?: boolean;
  className?: string;
}

/**
 * @description Displays narrative text with properly separated move information and chi costs
 */
export const NarrativeBubble: React.FC<NarrativeBubbleProps> = ({
  character,
  mainLine,
  move,
  chi,
  isCritical = false,
  isDesperation = false,
  isEscalation = false,
  className = ''
}) => {
  const getCharacterColor = (charName: string): string => {
    switch (charName) {
      case 'Aang':
        return styles.aangColor;
      case 'Azula':
        return styles.azulaColor;
      case 'Narrator':
        return styles.narratorColor;
      case 'System':
        return styles.systemColor;
      default:
        return styles.defaultColor;
    }
  };

  const getMoveBadgeClass = (): string => {
    if (isDesperation) return styles.desperationBadge;
    if (isEscalation) return styles.escalationBadge;
    if (isCritical) return styles.criticalBadge;
    return styles.moveBadge;
  };

  return (
    <div className={`${styles.narrativeBubble} ${className}`}>
      <div className={styles.narrativeHeader}>
        <span className={`${styles.characterName} ${getCharacterColor(character)}`}>
          {character}
        </span>
        {move && (
          <span className={`${styles.moveBadge} ${getMoveBadgeClass()}`}>
            {move}
          </span>
        )}
        {chi !== undefined && (
          <span className={styles.chiCost}>
            💠 {chi} chi
          </span>
        )}
      </div>
      
      <div className={`${styles.mainLine} ${isCritical ? styles.criticalText : ''}`}>
        {mainLine}
      </div>
    </div>
  );
}; 