// CONTEXT: BattleLog, // FOCUS: DetailLevelSelection
import { LogDetailLevel } from '../../battle-simulation/types';
import styles from './LogDetailSelector.module.css';

/**
 * @description Props for the LogDetailSelector component.
 */
export type LogDetailSelectorProps = {
  currentLevel: LogDetailLevel;
  onLevelChange: (level: LogDetailLevel) => void;
  showAIOption?: boolean;
};

/**
 * @description Renders a selector for log detail levels with toggle buttons.
 * @returns {JSX.Element} The log detail selector.
 */
export function LogDetailSelector({ 
  currentLevel, 
  onLevelChange, 
  showAIOption = true 
}: LogDetailSelectorProps) {
  const levels: Array<{ level: LogDetailLevel; label: string; icon: string; description: string }> = [
    {
      level: 'narrative',
      label: 'Narrative',
      icon: '📖',
      description: 'Cinematic storytelling'
    },
    {
      level: 'battle',
      label: 'Battle',
      icon: '⚔️',
      description: 'Action & results'
    },
    {
      level: 'ai',
      label: 'AI',
      icon: '🤖',
      description: 'Decision analysis'
    },
    {
      level: 'all',
      label: 'All',
      icon: '📋',
      description: 'Complete details'
    }
  ];

  const visibleLevels = showAIOption ? levels : levels.filter(l => l.level !== 'ai');

  return (
    <div className={styles.container}>
      <div className={styles.label}>Log Detail:</div>
      <div className={styles.buttons}>
        {visibleLevels.map(({ level, label, icon, description }) => (
          <button
            key={level}
            onClick={() => onLevelChange(level)}
            className={`${styles.button} ${currentLevel === level ? styles.active : ''}`}
            title={description}
          >
            <span className={styles.icon}>{icon}</span>
            <span className={styles.label}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 