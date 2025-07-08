// CONTEXT: BattleLog, // FOCUS: UIRendering
import { useEffect, useRef, useState } from 'react';
import { BattleLogEntry, AILogEntry, LogDetailLevel, LogEntryType } from '../../battle-simulation/types';
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

// Avatar image mapping utility
const avatarMap: Record<string, string> = {
  aang: '/assets/aang.jpg',
  azula: '/assets/azula.jpg',
  // Add more characters as needed
};
function getAvatar(name: string): string {
  const normalized = name.trim().toLowerCase();
  return avatarMap[normalized] || '/assets/default.jpg'; // fallback image
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
  const [eventTypeFilter, setEventTypeFilter] = useState<LogEntryType | 'ALL'>('ALL');

  // Auto-scroll to the bottom when new log entries are added.
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logEntries, battleLog]);

  // DEBUG: Print all log entry types and actions
  if (typeof window !== 'undefined' && battleLog.length > 0) {
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
    const filteredLog = eventTypeFilter === 'ALL'
      ? battleLog
      : battleLog.filter(entry => entry.type === eventTypeFilter);

    if (filteredLog.length > 0) {
      return filteredLog.map((entry) => {
        console.log('RENDERING LOG ENTRY:', entry);
        if (entry.type === 'dialogue') {
          return (
            <div className={styles.container} key={entry.id || entry.turn}>
              <div className={styles.actorBlock}>
                <img src={getAvatar(entry.actor)} alt={`${entry.actor} icon`} className={styles.iconImgLarge} />
                <span className={styles.actorNameLarge}>{entry.actor}:</span>
              </div>
              <p className={styles.dialogueText}>{entry.narrative}</p>
            </div>
          );
        }
        if (entry.type === 'narrative') {
          return (
            <div className={styles.narrativeBubble} key={entry.id || entry.turn}>
              <span className={styles.turnLabel}>Turn {entry.turn}</span>
              <p className={styles.narrativeText}><i>{typeof entry.narrative === 'string' ? entry.narrative : entry.narrative.join(' ')}</i></p>
            </div>
          );
        }
        if (entry.type === 'mechanics') {
          return (
            <div className={styles.mechanicsBubble} key={entry.id || entry.turn}>
              <span className={styles.mechanicsCue}>⚙️</span>
              <span className={styles.mechanicsText}>{entry.result}</span>
            </div>
          );
        }
        if (entry.type === 'system') {
          return (
            <div className={styles.systemBubble} key={entry.id || entry.turn}>
              <span className={styles.systemCue}>🖥️</span>
              <span className={styles.systemText}>{entry.narrative || entry.result}</span>
            </div>
          );
        }
        return null;
      });
    }
    return null;
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
              onChange={(e) => setEventTypeFilter(e.target.value as LogEntryType | 'ALL')}
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