// CONTEXT: TechnicalLog, // FOCUS: AIDecisionDisplay
import { useState } from 'react';
import { AILogEntry } from '../../battle-simulation/types';
import styles from './TechnicalLog.module.css';

/**
 * @description Props for the TechnicalLog component.
 */
export type TechnicalLogProps = {
  aiLog: AILogEntry[];
  showCopyButton?: boolean;
};

/**
 * @description Formats AI log entries for detailed display.
 * @param {AILogEntry[]} entries - The AI log entries to format.
 * @returns {string} Formatted AI log text.
 */
function formatDetailedAILog(entries: AILogEntry[]): string {
  return entries.map(entry => {
    const consideredActions = entry.consideredActions
      .map(action => `    - ${action.move} (Score: ${action.score}): ${action.reason}`)
      .join('\n');
    
    const abilities = entry.perceivedState.self.abilities
      .map(ability => `    - ${ability.name} (${ability.type}, Power: ${ability.power})`)
      .join('\n');
    
    return `=== Turn ${entry.turn} - ${entry.agent}'s Decision ===
Timestamp: ${new Date(entry.timestamp).toLocaleTimeString()}

PERCEIVED STATE:
  Self (${entry.agent}):
    Health: ${entry.perceivedState.self.health}HP
    Defense: ${entry.perceivedState.self.defense}DEF
    Personality: ${entry.perceivedState.self.personality}
    Available Abilities:
${abilities}
  
  Enemy (${entry.perceivedState.enemy.name}):
    Health: ${entry.perceivedState.enemy.health}HP
    Defense: ${entry.perceivedState.enemy.defense}DEF
    Personality: ${entry.perceivedState.enemy.personality}
  
  Battle Context:
    Round: ${entry.perceivedState.round}
    Cooldowns: ${Object.keys(entry.perceivedState.cooldowns).length > 0 ? 
      Object.entries(entry.perceivedState.cooldowns).map(([ability, cooldown]) => `${ability}: ${cooldown}`).join(', ') : 
      'None'}

DECISION PROCESS:
  Considered Actions:
${consideredActions}
  
  Final Decision: ${entry.chosenAction}
  Reasoning: ${entry.reasoning}
  ${entry.narrative ? `Narrative: ${entry.narrative}` : ''}

---`;
  }).join('\n\n');
}

/**
 * @description Renders a detailed technical log of AI decision-making with expandable sections.
 * @returns {JSX.Element} The technical log display.
 */
export function TechnicalLog({ aiLog, showCopyButton = true }: TechnicalLogProps) {
  const [expandedTurns, setExpandedTurns] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);

  const toggleTurnExpansion = (turn: number) => {
    const newExpanded = new Set(expandedTurns);
    if (newExpanded.has(turn)) {
      newExpanded.delete(turn);
    } else {
      newExpanded.add(turn);
    }
    setExpandedTurns(newExpanded);
  };

  const handleCopyAILog = async () => {
    const formattedLog = formatDetailedAILog(aiLog);
    try {
      await navigator.clipboard.writeText(formattedLog);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy AI log:', err);
    }
  };

  const renderAILogEntry = (entry: AILogEntry, index: number) => {
    const isExpanded = expandedTurns.has(entry.turn);
    const isLatest = index === aiLog.length - 1;

    return (
      <div key={`${entry.turn}-${entry.agent}-${index}`} className={`${styles.logEntry} ${isLatest ? styles.latest : ''}`}>
        <div className={styles.entryHeader} onClick={() => toggleTurnExpansion(entry.turn)}>
          <div className={styles.turnInfo}>
            <span className={styles.turnNumber}>Turn {entry.turn}</span>
            <span className={styles.agent}>{entry.agent}</span>
            <span className={styles.decision}>{entry.chosenAction}</span>
          </div>
          <div className={styles.expandButton}>
            {isExpanded ? '▼' : '▶'}
          </div>
        </div>
        
        {isExpanded && (
          <div className={styles.expandedContent}>
            <div className={styles.section}>
              <h4>Perceived State</h4>
              <div className={styles.stateGrid}>
                <div className={styles.stateColumn}>
                  <h5>Self ({entry.agent})</h5>
                  <p>Health: {entry.perceivedState.self.health}HP</p>
                  <p>Defense: {entry.perceivedState.self.defense}DEF</p>
                  <p>Personality: {entry.perceivedState.self.personality}</p>
                  <div className={styles.abilities}>
                    <h6>Abilities:</h6>
                    {entry.perceivedState.self.abilities.map(ability => (
                      <div key={ability.id} className={styles.ability}>
                        {ability.name} ({ability.type}, Power: {ability.power})
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.stateColumn}>
                  <h5>Enemy ({entry.perceivedState.enemy.name})</h5>
                  <p>Health: {entry.perceivedState.enemy.health}HP</p>
                  <p>Defense: {entry.perceivedState.enemy.defense}DEF</p>
                  <p>Personality: {entry.perceivedState.enemy.personality}</p>
                </div>
              </div>
            </div>
            
            <div className={styles.section}>
              <h4>Decision Process</h4>
              <div className={styles.consideredActions}>
                {entry.consideredActions.map((action, actionIndex) => (
                  <div key={actionIndex} className={`${styles.action} ${action.move === entry.chosenAction ? styles.chosen : ''}`}>
                    <div className={styles.actionHeader}>
                      <span className={styles.actionName}>{action.move}</span>
                      <span className={styles.actionScore}>Score: {action.score}</span>
                    </div>
                    <div className={styles.actionReason}>{action.reason}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={styles.section}>
              <h4>Final Decision</h4>
              <p className={styles.reasoning}>{entry.reasoning}</p>
              {entry.narrative && (
                <p className={styles.narrative}>{entry.narrative}</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>AI Decision Log</h3>
        {showCopyButton && (
          <button 
            onClick={handleCopyAILog}
            className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
            title="Copy detailed AI log"
          >
            {copied ? '✓ Copied!' : '🤖 Copy AI Log'}
          </button>
        )}
      </div>
      <div className={styles.logContainer}>
        {aiLog.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No AI decisions logged yet.</p>
            <p>Start a battle to see AI decision-making in action!</p>
          </div>
        ) : (
          aiLog.map(renderAILogEntry)
        )}
      </div>
    </div>
  );
} 