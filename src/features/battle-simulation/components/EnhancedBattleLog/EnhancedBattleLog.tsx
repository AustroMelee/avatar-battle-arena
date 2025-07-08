// CONTEXT: Enhanced Battle Log
// RESPONSIBILITY: Display battle events with visual effects, animations, and dramatic formatting
import React, { useState, useEffect } from 'react';
import { BattleLogEntry } from '../../types';
import styles from './EnhancedBattleLog.module.css';

interface EnhancedBattleLogProps {
  entries: BattleLogEntry[];
  maxEntries?: number;
  playerSide: string;
  type: string;
}

/**
 * @description Enhanced battle log with visual effects and animations.
 */
export const EnhancedBattleLog: React.FC<EnhancedBattleLogProps> = ({
  entries,
  maxEntries = 20,
  playerSide,
  type
}) => {
  const [visibleEntries, setVisibleEntries] = useState<BattleLogEntry[]>([]);
  const [animations, setAnimations] = useState<Set<string>>(new Set());

  // Limit entries and add animations for new ones
  useEffect(() => {
    const limitedEntries = entries.slice(-maxEntries);
    setVisibleEntries(limitedEntries);
    
    // Add animation for new entries
    if (entries.length > visibleEntries.length) {
      const newEntryIds = entries
        .slice(visibleEntries.length)
        .map(entry => entry.id);
      
      setAnimations(prev => new Set([...prev, ...newEntryIds]));
      
      // Remove animation after delay
      setTimeout(() => {
        setAnimations(prev => {
          const newSet = new Set(prev);
          newEntryIds.forEach(id => newSet.delete(id));
          return newSet;
        });
      }, 1000);
    }
  }, [entries, maxEntries, visibleEntries.length]);

  /**
   * @description Gets the appropriate icon for a battle event.
   */
  const getEventIcon = (entry: BattleLogEntry): string => {
    if (entry.type === 'VICTORY') return '🏆';
    if (entry.type === 'DESPERATION') return '⚡';
    if (entry.type === 'NARRATIVE') return '💭';
    if (entry.meta?.crit === true) return '💥';
    if (entry.meta?.climax === true) return '🔥';
    if (entry.meta?.rest === true) return '🔄';
    if (entry.meta?.heal === true) return '💚';
    if (entry.meta?.piercing === true) return '⚔️';
    if (entry.damage && entry.damage > 15) return '💢';
    if (entry.damage && entry.damage > 0) return '⚔️';
    if (entry.abilityType === 'defense_buff') return '🛡️';
    return '🎯';
  };

  /**
   * @description Gets CSS classes for an entry based on its properties.
   */
  const getEntryClasses = (entry: BattleLogEntry): string => {
    const classes = [styles.logEntry];
    
    // Type-based classes
    classes.push(styles[entry.type.toLowerCase()]);
    
    // Meta-based classes
    if (entry.meta?.crit === true) classes.push(styles.critical);
    if (entry.meta?.climax === true) classes.push(styles.climax);
    if (entry.meta?.rest === true) classes.push(styles.rest);
    if (entry.meta?.heal === true) classes.push(styles.heal);
    if (entry.meta?.piercing === true) classes.push(styles.piercing);
    if (entry.meta?.desperation === true) classes.push(styles.desperation);
    
    // Damage-based classes
    if (entry.damage) {
      if (entry.damage > 20) classes.push(styles.massiveDamage);
      else if (entry.damage > 10) classes.push(styles.highDamage);
      else if (entry.damage > 0) classes.push(styles.normalDamage);
    }
    
    // Animation class
    if (animations.has(entry.id)) {
      classes.push(styles.newEntry);
    }
    
    return classes.join(' ');
  };

  /**
   * @description Formats the entry text with enhanced styling.
   */
  const formatEntryText = (entry: BattleLogEntry): React.ReactNode => {
    const icon = getEventIcon(entry);
    // Prioritize enhanced narratives over mechanical results
    const baseText = typeof entry.narrative === 'string' ? entry.narrative : entry.narrative.join(' ');
    
    // Add damage highlight
    if (entry.damage) {
      const damageText = ` (${entry.damage} damage)`;
      const parts = baseText.split(damageText);
      
      if (parts.length > 1) {
        return (
          <React.Fragment>
            {icon} {parts[0]}
            <span className={styles.damageHighlight}>{damageText}</span>
            {parts[1]}
          </React.Fragment>
        );
      }
    }
    
    // Add critical hit highlight
    if (entry.meta?.crit === true) {
      const critText = ' (CRITICAL!)';
      const parts = baseText.split(critText);
      
      if (parts.length > 1) {
        return (
          <React.Fragment>
            {icon} {parts[0]}
            <span className={styles.criticalHighlight}>{critText}</span>
            {parts[1]}
          </React.Fragment>
        );
      }
    }
    
    return (
      <React.Fragment>
        {icon} {baseText}
      </React.Fragment>
    );
  };

  /**
   * @description Gets the timestamp display for an entry.
   */
  const getTimestamp = (entry: BattleLogEntry): string => {
    const date = new Date(entry.timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`${styles.container} ${styles[playerSide]} ${type ? styles[type.toLowerCase()] : ''}`}>
      <div className={styles.header}>
        <h3>Battle Log</h3>
        <div className={styles.stats}>
          <span className={styles.entryCount}>{visibleEntries.length} entries</span>
          <span className={styles.turnCount}>Turn {visibleEntries[visibleEntries.length - 1]?.turn || 0}</span>
        </div>
      </div>
      
      <div className={styles.logContainer}>
        {visibleEntries.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>⚔️</span>
            <p>Battle log is empty</p>
          </div>
        ) : (
          visibleEntries.map((entry, index) => (
            <div 
              key={entry.id} 
              className={getEntryClasses(entry)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={styles.entryHeader}>
                <span className={styles.turnNumber}>T{entry.turn}</span>
                <span className={styles.actor}>{entry.actor}</span>
                <span className={styles.timestamp}>{getTimestamp(entry)}</span>
              </div>
              
              <div className={styles.entryContent}>
                {formatEntryText(entry)}
              </div>
              
              {entry.meta && Object.keys(entry.meta).length > 0 && (
                <div className={styles.entryMeta}>
                  {entry.meta.resourceCost !== undefined && (
                    <span className={styles.resourceCost}>💠 {Number(entry.meta.resourceCost)} chi</span>
                  )}
                  {entry.meta.climax === true && (
                    <span className={styles.climaxBadge}>🔥 CLIMAX</span>
                  )}
                  {entry.meta.desperation === true && (
                    <span className={styles.desperationBadge}>⚡ DESPERATION</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 