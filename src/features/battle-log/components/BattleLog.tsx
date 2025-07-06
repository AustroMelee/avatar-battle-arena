// CONTEXT: BattleLog, // FOCUS: UIRendering
import { useEffect, useRef, useState } from 'react';
import { BattleLogEntry, AILogEntry, LogDetailLevel, LogEventType } from '../../battle-simulation/types';
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
      case 'narrative': {
        return entry.narrative || `${entry.actor} ${entry.action.toLowerCase()}.`;
      }
      case 'battle': {
        const chiCost = entry.meta?.resourceCost ? ` (${entry.meta.resourceCost} chi)` : '';
        // Prioritize enhanced narratives over mechanical results
        const displayText = entry.narrative || entry.result;
        return `Turn ${entry.turn}: ${entry.actor} uses ${entry.action}${chiCost}. ${displayText}`;
      }
      case 'all': {
        const cost = entry.meta?.resourceCost ? ` (${entry.meta.resourceCost} chi)` : '';
        // Prioritize enhanced narratives over mechanical results
        const displayText = entry.narrative || entry.result;
        return `Turn ${entry.turn}: ${entry.actor} uses ${entry.action}${cost}. ${displayText}${entry.narrative && entry.narrative !== entry.result ? `\n  Enhanced: ${entry.narrative}` : ''}`;
      }
      default: {
        // Prioritize enhanced narratives over mechanical results
        const displayText = entry.narrative || entry.result;
        return `${entry.actor} uses ${entry.action}. ${displayText}`;
      }
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
 * @description Gets the appropriate icon for a move type.
 * @param {string} moveName - The name of the move.
 * @param {string} abilityType - The type of ability.
 * @returns {string} The icon emoji.
 */
function getMoveIcon(moveName: string, abilityType?: string): string {
  // Desperation moves
  if (moveName.includes('Avatar State') || moveName.includes('Phoenix Rage')) {
    return '🔥';
  }
  if (moveName.includes('Tornado') || moveName.includes('Storm')) {
    return '⚡';
  }
  
  // Attack moves
  if (abilityType === 'attack') {
    if (moveName.includes('Lightning')) return '⚡';
    if (moveName.includes('Fire')) return '🔥';
    if (moveName.includes('Wind') || moveName.includes('Air')) return '💨';
    if (moveName.includes('Strike')) return '👊';
    return '⚔️';
  }
  
  // Defense moves
  if (abilityType === 'defense_buff') {
    if (moveName.includes('Shield')) return '🛡️';
    if (moveName.includes('Jets')) return '🚀';
    if (moveName.includes('Focus')) return '🧘';
    if (moveName.includes('Recovery')) return '💚';
    return '🛡️';
  }
  
  return '🎯';
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
  const [eventTypeFilter, setEventTypeFilter] = useState<LogEventType | 'ALL'>('ALL');

  // Auto-scroll to the bottom when new log entries are added.
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logEntries, battleLog]);

  // DEBUG: Print all log entry types and actions
  if (typeof window !== 'undefined' && battleLog.length > 0) {
    // eslint-disable-next-line no-console
    console.log('[BattleLog] Entry types:', battleLog.map(e => `${e.turn} ${e.type} ${e.action}`));
  }

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
    // Filter entries by event type
    const filteredLog = eventTypeFilter === 'ALL' 
      ? battleLog 
      : battleLog.filter(entry => entry.type === eventTypeFilter);
    
    if (filteredLog.length > 0) {
      return filteredLog.map((entry, index) => (
        <div
          key={entry.id || `${entry.turn}-${entry.actor}-${index}`}
          className={`${styles.logEntry} ${index === filteredLog.length - 1 ? styles.latest : ''} ${styles[`event-${entry.type.toLowerCase()}`] || ''}`}
        >
          <div className={styles.logHeader}>
            <span className={styles.turnNumber}>Turn {entry.turn}</span>
            <span className={styles.eventType}>{entry.type}</span>
            <span className={styles.actor}>{entry.actor}</span>
            <span className={styles.moveIcon}>{getMoveIcon(entry.action, entry.abilityType)}</span>
            <span className={styles.action}>{entry.action}</span>
            {entry.meta?.resourceCost !== undefined && (
              <span className={styles.chiCost}>({entry.meta.resourceCost} chi)</span>
            )}
          </div>
          <div className={styles.logResult}>{entry.result}</div>
          {currentDetailLevel === 'all' && entry.narrative && (
            <div className={styles.logNarrative}>{entry.narrative}</div>
          )}
          {entry.meta && Object.keys(entry.meta).length > 0 && (
            <div className={styles.logMeta}>
              {entry.meta.isFinisher && <span className={styles.metaFinisher}>⚡ FINISHER!</span>}
              {entry.meta.isDesperation && <span className={styles.metaDesperation}>🔥 DESPERATION!</span>}
              {entry.meta.crit && <span className={styles.metaCrit}>💥 CRITICAL!</span>}
              {entry.meta.piercing && <span className={styles.metaPiercing}>⚡ PIERCING</span>}
              {entry.meta.heal && <span className={styles.metaHeal}>💚 HEAL</span>}
              {entry.meta.combo && <span className={styles.metaCombo}>🔥 COMBO x{entry.meta.combo}</span>}
            </div>
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
          <div className={styles.eventTypeFilter}>
            <span className={styles.filterLabel}>Filter:</span>
            <select 
              value={eventTypeFilter} 
              onChange={(e) => setEventTypeFilter(e.target.value as LogEventType | 'ALL')}
              className={styles.filterSelect}
            >
              <option value="ALL">All Events</option>
              <option value="MOVE">Moves</option>
              <option value="STATUS">Status</option>
              <option value="KO">KOs</option>
              <option value="TURN">Turns</option>
              <option value="INFO">Info</option>
              <option value="VICTORY">Victory</option>
              <option value="DRAW">Draw</option>
              <option value="ESCAPE">Escape</option>
              <option value="DESPERATION">Desperation</option>
            </select>
          </div>
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
      <div className={styles.logContainer} ref={logContainerRef}>
        {renderLogEntries()}
      </div>
    </div>
  );
} 