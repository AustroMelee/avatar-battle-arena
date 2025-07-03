// CONTEXT: BattleLog, // FOCUS: UIRendering
import { useEffect, useRef, useState } from 'react';
import { BattleLogEntry, AILogEntry, LogDetailLevel } from '../../battle-simulation/types';
import { LogDetailSelector } from './LogDetailSelector';
import styles from './BattleLog.module.css';

/**
 * @description Props for the BattleLog component.
 */
export type BattleLogProps = {
  logEntries: string[];
  battleLog?: BattleLogEntry[];
  aiLog?: AILogEntry[];
  detailLevel?: LogDetailLevel;
  showCopyButton?: boolean;
};

/**
 * @description Formats battle log entries for display based on detail level.
 * @param {BattleLogEntry[]} entries - The battle log entries to format.
 * @param {LogDetailLevel} detailLevel - The detail level to display.
 * @returns {string} Formatted log text.
 */
function formatBattleLog(entries: BattleLogEntry[], detailLevel: LogDetailLevel): string {
  return entries.map(entry => {
    switch (detailLevel) {
      case 'narrative':
        return entry.narrative || `${entry.actor} ${entry.action.toLowerCase()}.`;
      case 'battle':
        return `Turn ${entry.turn}: ${entry.actor} uses ${entry.action}. ${entry.result}`;
      case 'all':
        return `Turn ${entry.turn}: ${entry.actor} uses ${entry.action}. ${entry.result}${entry.narrative ? `\n  Narrative: ${entry.narrative}` : ''}`;
      default:
        return `${entry.actor} uses ${entry.action}. ${entry.result}`;
    }
  }).join('\n');
}

/**
 * @description Formats AI log entries for display.
 * @param {AILogEntry[]} entries - The AI log entries to format.
 * @returns {string} Formatted AI log text.
 */
function formatAILog(entries: AILogEntry[]): string {
  return entries.map(entry => {
    const consideredActions = entry.consideredActions
      .map(action => `  - ${action.move} (Score: ${action.score}): ${action.reason}`)
      .join('\n');
    
    return `Turn ${entry.turn} - ${entry.agent}'s Decision:
Perceived State:
  Self: ${entry.perceivedState.self.health}HP, ${entry.perceivedState.self.defense}DEF
  Enemy: ${entry.perceivedState.enemy.name} (${entry.perceivedState.enemy.health}HP, ${entry.perceivedState.enemy.defense}DEF)
  Round: ${entry.perceivedState.round}

Considered Actions:
${consideredActions}

Chosen Action: ${entry.chosenAction}
Reasoning: ${entry.reasoning}
${entry.narrative ? `Narrative: ${entry.narrative}` : ''}
---`;
  }).join('\n\n');
}

/**
 * @description Renders a human-readable log of battle events with copyable functionality.
 * @returns {JSX.Element} The battle log display.
 */
export function BattleLog({ 
  logEntries, 
  battleLog = [], 
  aiLog = [], 
  detailLevel = 'battle',
  showCopyButton = true 
}: BattleLogProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [currentDetailLevel, setCurrentDetailLevel] = useState<LogDetailLevel>(detailLevel);

  // Auto-scroll to the bottom when new log entries are added.
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logEntries, battleLog]);

  const handleCopyBattleLog = async () => {
    const formattedLog = formatBattleLog(battleLog, currentDetailLevel);
    try {
      await navigator.clipboard.writeText(formattedLog);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy battle log:', err);
    }
  };

  const handleCopyAILog = async () => {
    const formattedLog = formatAILog(aiLog);
    try {
      await navigator.clipboard.writeText(formattedLog);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy AI log:', err);
    }
  };

  const renderLogEntries = () => {
    if (battleLog.length > 0) {
      return battleLog.map((entry, index) => (
        <div
          key={`${entry.turn}-${entry.actor}-${index}`}
          className={`${styles.logEntry} ${index === battleLog.length - 1 ? styles.latest : ''}`}
        >
          <div className={styles.logHeader}>
            <span className={styles.turnNumber}>Turn {entry.turn}</span>
            <span className={styles.actor}>{entry.actor}</span>
            <span className={styles.action}>{entry.action}</span>
          </div>
          <div className={styles.logResult}>{entry.result}</div>
          {currentDetailLevel === 'all' && entry.narrative && (
            <div className={styles.logNarrative}>{entry.narrative}</div>
          )}
        </div>
      ));
    }
    
    // Fallback to legacy string entries
    return logEntries.map((entry, index) => (
      <div
        key={index}
        className={`${styles.logEntry} ${index === logEntries.length - 1 ? styles.latest : ''}`}
      >
        {entry}
      </div>
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Battle Log</h3>
        <div className={styles.headerControls}>
          <LogDetailSelector
            currentLevel={currentDetailLevel}
            onLevelChange={setCurrentDetailLevel}
            showAIOption={aiLog.length > 0}
          />
          {showCopyButton && (
            <div className={styles.copyButtons}>
              <button 
                onClick={handleCopyBattleLog}
                className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
                title="Copy battle log"
              >
                {copied ? '✓ Copied!' : '📋 Copy Log'}
              </button>
              {aiLog.length > 0 && (
                <button 
                  onClick={handleCopyAILog}
                  className={`${styles.copyButton} ${styles.aiCopyButton}`}
                  title="Copy AI decision log"
                >
                  🤖 Copy AI Log
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className={styles.logListContainer} ref={logContainerRef}>
        {renderLogEntries()}
      </div>
    </div>
  );
} 