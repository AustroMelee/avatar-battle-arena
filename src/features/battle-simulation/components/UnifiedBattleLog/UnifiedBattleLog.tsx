// CONTEXT: Unified Battle Log
// RESPONSIBILITY: Single log component with tabs for narrative and AI logs
import React, { useState } from 'react';
import { BattleLogEntry, AILogEntry } from '../../types';
import styles from './UnifiedBattleLog.module.css';

interface UnifiedBattleLogProps {
  battleLog: BattleLogEntry[];
  aiLog: AILogEntry[];
  maxEntries?: number;
}

type LogTab = 'narrative' | 'ai';

/**
 * @description Unified battle log with tabs for narrative and AI logs.
 */
export const UnifiedBattleLog: React.FC<UnifiedBattleLogProps> = ({
  battleLog,
  aiLog,
  maxEntries = 15
}) => {
  const [activeTab, setActiveTab] = useState<LogTab>('narrative');
  const [copied, setCopied] = useState(false);

  /**
   * @description Gets the appropriate icon for a battle event.
   */
  const getEventIcon = (entry: BattleLogEntry): string => {
    // Opening sequence entries get a special icon
    if (entry.turn >= 1 && entry.turn <= 6) {
      return '🎭';
    }
    
    if (entry.type === 'VICTORY') return '🏆';
    if (entry.type === 'DESPERATION') return '⚡';
    if (entry.type === 'FINISHER') return '💥';
    if (entry.type === 'NARRATIVE') return '💭';
    if (entry.meta?.crit === true) return '💥';
    if (entry.meta?.finisher === true) return '🔥';
    if (entry.meta?.rest === true) return '🔄';
    if (entry.meta?.heal === true) return '💚';
    if (entry.meta?.piercing === true) return '⚔️';
    if (entry.damage && entry.damage > 15) return '💢';
    if (entry.damage && entry.damage > 0) return '⚔️';
    if (entry.abilityType === 'defense_buff') return '🛡️';
    return '🎭';
  };

  /**
   * @description Gets CSS classes for a battle log entry.
   */
  const getBattleEntryClasses = (entry: BattleLogEntry): string => {
    const classes = [styles.logEntry];
    
    // Opening sequence classes (turns 1-6)
    if (entry.turn >= 1 && entry.turn <= 6) {
      classes.push(styles.openingSequence);
    }
    
    // Type-based classes
    classes.push(styles[entry.type.toLowerCase()]);
    
    // Meta-based classes
    if (entry.meta?.crit === true) classes.push(styles.critical);
    if (entry.meta?.finisher === true) classes.push(styles.finisher);
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
    
    return classes.join(' ');
  };

  /**
   * @description Formats the battle log entry text.
   */
  const formatBattleEntryText = (entry: BattleLogEntry): React.ReactNode => {
    const icon = getEventIcon(entry);
    // Prioritize enhanced narratives over mechanical results
    const baseText = entry.narrative || entry.result || entry.action;
    
    // Add damage highlight
    if (entry.damage) {
      const damageText = ` (${entry.damage} damage)`;
      const parts = baseText.split(damageText);
      
      if (parts.length > 1) {
        return (
          <>
            {icon} {parts[0]}
            <span className={styles.damageHighlight}>{damageText}</span>
            {parts[1]}
          </>
        );
      }
    }
    
    // Add critical hit highlight
    if (entry.meta?.crit === true) {
      const critText = ' (CRITICAL!)';
      const parts = baseText.split(critText);
      
      if (parts.length > 1) {
        return (
          <>
            {icon} {parts[0]}
            <span className={styles.criticalHighlight}>{critText}</span>
            {parts[1]}
          </>
        );
      }
    }
    
    return (
      <>
        {icon} {baseText}
      </>
    );
  };

  /**
   * @description Gets the timestamp display for an entry.
   */
  const getTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  /**
   * @description Renders the narrative/battle log tab.
   */
  const renderNarrativeTab = () => {
    const limitedEntries = battleLog.slice(-maxEntries);

    return (
      <div className={styles.tabContent}>
        {limitedEntries.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>⚔️</span>
            <p>Battle log is empty</p>
          </div>
        ) : (
          limitedEntries.map((entry) => (
            <div key={entry.id} className={getBattleEntryClasses(entry)}>
              <div className={styles.entryHeader}>
                <span className={styles.turnNumber}>T{entry.turn}</span>
                <span className={styles.actor}>{entry.actor}</span>
                <span className={styles.timestamp}>{getTimestamp(entry.timestamp)}</span>
              </div>
              
              <div className={styles.entryContent}>
                {formatBattleEntryText(entry)}
              </div>
              
              {entry.meta && Object.keys(entry.meta).length > 0 && (
                <div className={styles.entryMeta}>
                  {entry.meta.resourceCost !== undefined && (
                    <span className={styles.resourceCost}>💠 {Number(entry.meta.resourceCost)} chi</span>
                  )}
                  {entry.meta.finisher === true && (
                    <span className={styles.finisherBadge}>🔥 FINISHER</span>
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
    );
  };

  /**
   * @description Renders the AI log tab.
   */
  const renderAITab = () => {
    const limitedEntries = aiLog.slice(-maxEntries);

    return (
      <div className={styles.tabContent}>
        {limitedEntries.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🤖</span>
            <p>AI log is empty</p>
          </div>
        ) : (
          limitedEntries.map((entry, index) => (
            <div key={`${entry.turn}-${entry.agent}-${index}`} className={`${styles.logEntry} ${styles.aiEntry}`}>
              <div className={styles.entryHeader}>
                <span className={styles.turnNumber}>T{entry.turn}</span>
                <span className={styles.actor}>{entry.agent}</span>
                <span className={styles.timestamp}>{getTimestamp(entry.timestamp)}</span>
              </div>
              
              <div className={styles.entryContent}>
                <span className={styles.aiIcon}>🤖</span>
                <span className={styles.aiAction}>{entry.chosenAction}</span>
              </div>
              
              {entry.reasoning && (
                <div className={styles.aiReasoning}>
                  <strong>Reasoning:</strong> {entry.reasoning}
                </div>
              )}
              
              {entry.perceivedState && (
                <div className={styles.aiPerceivedState}>
                  <strong>Perceived State:</strong> 
                  <div className={styles.perceivedStateDetails}>
                    <div>Self Health: {entry.perceivedState.self.health}%</div>
                    <div>Enemy Health: {entry.perceivedState.enemy.health}%</div>
                    <div>Self Chi: {entry.perceivedState.self.resources.chi}</div>
                  </div>
                </div>
              )}
              
              {entry.consideredActions && entry.consideredActions.length > 0 && (
                <div className={styles.aiConsideredActions}>
                  <strong>Considered Actions:</strong>
                  <ul>
                    {entry.consideredActions.map((action, actionIndex) => (
                      <li key={actionIndex}>
                        {action.move} (Score: {action.score}) - {action.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  /**
   * @description Formats all logs for clipboard copying.
   */
  const formatAllLogsForClipboard = () => {
    const battleLogText = battleLog.map(entry => {
      const turn = `T${entry.turn}`;
      const actor = entry.actor;
      const action = entry.action || entry.narrative || entry.result || '';
      const chi = entry.meta && entry.meta.resourceCost !== undefined ? ` (${entry.meta.resourceCost} chi)` : '';
      return `${turn} ${actor}: ${action}${chi}`.trim();
    }).join('\n');
    const aiLogText = aiLog.map(entry => {
      const turn = `T${entry.turn}`;
      const agent = entry.agent;
      const chosen = entry.chosenAction ? `Chose ${entry.chosenAction}` : '';
      const reason = entry.reasoning ? `Reason: ${entry.reasoning}` : '';
      return `${turn} ${agent}: ${chosen}${reason ? '. ' + reason : ''}`.trim();
    }).join('\n');
    return `---\nBATTLE LOG\n---\n${battleLogText}\n\n---\nAI DECISIONS\n---\n${aiLogText}`;
  };

  /**
   * @description Handles copying all logs to clipboard.
   */
  const handleCopyAllLogs = async () => {
    const text = formatAllLogsForClipboard();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      // fallback: do nothing
    }
  };

  return (
    <div className={styles.unifiedBattleLog}>
      <div className={styles.header}>
        <h3>Battle Log</h3>
        <div className={styles.tabSelector}>
          <button
            className={`${styles.tab} ${activeTab === 'narrative' ? styles.active : ''}`}
            onClick={() => setActiveTab('narrative')}
          >
            📜 Narrative ({battleLog.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'ai' ? styles.active : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            🤖 AI Decisions ({aiLog.length})
          </button>
        </div>
        <button
          onClick={handleCopyAllLogs}
          style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 6, border: '1px solid #888', background: copied ? '#27ae60' : '#222', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
          title="Copy all logs to clipboard"
        >
          {copied ? 'Copied!' : '📋 Copy All Logs'}
        </button>
      </div>
      
      {activeTab === 'narrative' ? renderNarrativeTab() : renderAITab()}
    </div>
  );
}; 