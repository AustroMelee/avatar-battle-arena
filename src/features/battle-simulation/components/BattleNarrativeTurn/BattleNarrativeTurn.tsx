import React from 'react';
import styles from './BattleNarrativeTurn.module.css';

export interface BattleNarrativeTurnProps {
  character: string;
  mainNarrative: string;
  moveResult?: string;
  moveName?: string;
  chi?: number;
  damage?: number;
  specialEvent?: 'escalation' | 'desperation' | 'pattern_break' | 'critical' | 'breaking_point';
  isOneOff?: boolean;
  className?: string;
}

/**
 * @description Displays a complete battle narrative turn with proper separation of prose, moves, and mechanical outcomes
 */
export const BattleNarrativeTurn: React.FC<BattleNarrativeTurnProps> = ({
  character,
  mainNarrative,
  moveResult,
  moveName,
  chi,
  damage,
  specialEvent,
  isOneOff = false,
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

  const getSpecialEventClass = (event?: string): string => {
    switch (event) {
      case 'escalation':
        return styles.escalation;
      case 'desperation':
        return styles.desperation;
      case 'pattern_break':
        return styles.patternBreak;
      case 'critical':
        return styles.critical;
      case 'breaking_point':
        return styles.breakingPoint;
      default:
        return '';
    }
  };

  const getDamageClass = (damageValue?: number): string => {
    if (!damageValue) return '';
    if (damageValue > 30) return styles.devastating;
    if (damageValue > 20) return styles.heavy;
    if (damageValue > 10) return styles.medium;
    return styles.light;
  };

  return (
    <div className={`${styles.battleNarrativeTurn} ${className} ${isOneOff ? styles.oneOff : ''}`}>
      {/* Character and Main Narrative */}
      <div className={styles.narrativeHeader}>
        <span className={`${styles.characterName} ${getCharacterColor(character)}`}>
          {character}
        </span>
        {specialEvent && (
          <span className={`${styles.specialEvent} ${getSpecialEventClass(specialEvent)}`}>
            {specialEvent.replace('_', ' ').toUpperCase()}
          </span>
        )}
        {isOneOff && (
          <span className={styles.oneOffBadge}>
            ⚡
          </span>
        )}
      </div>

      {/* Main Narrative Text */}
      <div className={`${styles.mainNarrative} ${getSpecialEventClass(specialEvent)}`}>
        {mainNarrative}
      </div>

      {/* Move Information Row */}
      {(moveName || moveResult || chi !== undefined) && (
        <div className={styles.moveInfo}>
          {moveName && (
            <span className={styles.moveName}>
              {moveName}
            </span>
          )}
          {moveResult && (
            <span className={styles.moveResult}>
              {moveResult}
            </span>
          )}
          {chi !== undefined && (
            <span className={styles.chiCost}>
              💠 {chi} chi
            </span>
          )}
        </div>
      )}

      {/* Damage Outcome */}
      {damage !== undefined && (
        <div className={`${styles.damageOutcome} ${getDamageClass(damage)}`}>
          {damage > 30 && '💥 Devastating damage!'}
          {damage > 20 && damage <= 30 && '💥 Heavy damage!'}
          {damage > 10 && damage <= 20 && '💥 Solid damage!'}
          {damage > 0 && damage <= 10 && '💥 Light damage!'}
          {damage === 0 && '💨 Miss!'}
        </div>
      )}
    </div>
  );
}; 