// CONTEXT: Unified Battle Log
// RESPONSIBILITY: Single log component with tabs for narrative and AI logs
// 
// ⚠️ CRITICAL REQUIREMENT: Turn 1 logs MUST ALWAYS be visible by default
// No matter how many updates or changes we make, users MUST be able to see logs from T1
// This is essential for battle analysis and debugging - never hide early turns!
//
import React, { useState } from 'react';
import { BattleLogEntry, AILogEntry, BattleCharacter } from '../../types';
import styles from './UnifiedBattleLog.module.css';

interface UnifiedBattleLogProps {
  battleLog: BattleLogEntry[];
  aiLog: AILogEntry[];
  maxEntries?: number;
  participants?: BattleCharacter[];
}

type LogTab = 'narrative' | 'ai';

/**
 * @description Unified battle log with tabs for narrative and AI logs.
 */
export const UnifiedBattleLog: React.FC<UnifiedBattleLogProps> = ({
  battleLog,
  aiLog,
  maxEntries = 15,
  participants = []
}) => {
  // ⚠️ CRITICAL: Always start with showAllEntries = true to ensure T1 logs are visible
  // This is a hard requirement - users must always see the complete battle log by default
  const [activeTab, setActiveTab] = useState<LogTab>('narrative');
  const [copied, setCopied] = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(true); // ALWAYS TRUE BY DEFAULT
  const [turnFilter, setTurnFilter] = useState<number | null>(null);

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
    
    // Highlight state change
    if (entry.type === 'STATUS' && entry.action === 'State Change') {
      classes.push(styles.stateChange);
      if (entry.meta?.newControlState === 'Compromised') classes.push(styles.compromised);
      if (entry.meta?.newControlState === 'Defeated') classes.push(styles.defeated);
    }
    
    return classes.join(' ');
  };

  /**
   * @description Formats the battle log entry text.
   */
  const formatBattleEntryText = (entry: BattleLogEntry): React.ReactNode => {
    const icon = getEventIcon(entry);
    // Show disruption mechanics if present
    if (entry.meta?.controlShift !== undefined || entry.meta?.stabilityChange !== undefined) {
      return (
        <>
          {icon} <b>{entry.action}</b>: {entry.narrative}
          {entry.meta.controlShift !== undefined ? (
            <span className={styles.controlShift}> [Control Shift: {entry.meta.controlShift}]</span>
          ) : null}
          {entry.meta.stabilityChange !== undefined ? (
            <span className={styles.stabilityChange}> [Stability: -{entry.meta.stabilityChange}]</span>
          ) : null}
          {entry.meta.newControlState ? (
            <span className={styles.newControlState}> [State: {entry.meta.newControlState}]</span>
          ) : null}
        </>
      );
    }
    // Highlight state change log entries
    if (entry.type === 'STATUS' && entry.action === 'State Change') {
      return (
        <>
          {icon} <b>{entry.actor}</b>: <span className={styles.stateChangeBadge}>{entry.narrative}</span>
          {entry.meta?.newControlState ? (
            <span className={styles.newControlState}> [State: {entry.meta.newControlState}]</span>
          ) : null}
        </>
      );
    }
    // Fallback to old logic
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
   * ⚠️ CRITICAL: This function MUST always show T1 logs by default
   * The showAllEntries state should default to true to ensure complete visibility
   */
  const renderNarrativeTab = () => {
    // ⚠️ CRITICAL: Always show all entries by default to ensure T1 logs are visible
    // Only slice if explicitly requested by user (showAllEntries = false)
    let limitedEntries = showAllEntries ? battleLog : battleLog.slice(-maxEntries);
    
    // Apply turn filter if set
    if (turnFilter !== null) {
      limitedEntries = limitedEntries.filter(entry => entry.turn === turnFilter);
    }

    // DEV ONLY: Duplicate key detector
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const viteEnv = (import.meta as any).env;
    if ((viteEnv && viteEnv.MODE === 'development') || (!viteEnv || !viteEnv.MODE)) {
      const seen = new Set<string>();
      for (const entry of limitedEntries) {
        if (seen.has(entry.id)) {
          // eslint-disable-next-line no-console
          console.error('DUPLICATE LOG KEY DETECTED:', entry.id, entry);
          // eslint-disable-next-line no-console
          console.log('FULL BATTLE LOG:', limitedEntries);
        }
        seen.add(entry.id);
      }
    }

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
                  {entry.meta.resourceCost !== undefined ? (
                    <span className={styles.resourceCost}>💠 {Number(entry.meta.resourceCost)} chi</span>
                  ) : null}
                  {entry.meta.finisher === true ? (
                    <span className={styles.finisherBadge}>🔥 FINISHER</span>
                  ) : null}
                  {entry.meta.desperation === true ? (
                    <span className={styles.desperationBadge}>⚡ DESPERATION</span>
                  ) : null}
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
    let limitedEntries = showAllEntries ? aiLog : aiLog.slice(-maxEntries);
    
    // Apply turn filter if set
    if (turnFilter !== null) {
      limitedEntries = limitedEntries.filter(entry => entry.turn === turnFilter);
    }

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

  // Disruption state ticker (shows after each turn)
  const renderDisruptionTicker = () => {
    if (!participants.length) return null;
    return (
      <div className={styles.disruptionTicker} aria-label="Disruption State Ticker">
        {participants.map((char) => (
          <span key={char.name} className={`${styles.tickerState} ${styles[char.controlState.toLowerCase()]}`}
            aria-label={`${char.name} Control State: ${char.controlState}, Stability: ${char.stability}, Momentum: ${char.momentum}`}
          >
            <strong>{char.name}</strong>: {char.controlState} | S:{char.stability} | M:{char.momentum}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.unifiedBattleLog}>
      {renderDisruptionTicker()}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
          <input
            type="number"
            placeholder="Turn #"
            min="1"
            max={Math.max(...battleLog.map(e => e.turn), 1)}
            value={turnFilter || ''}
            onChange={(e) => setTurnFilter(e.target.value ? Number(e.target.value) : null)}
            style={{ 
              width: '60px', 
              padding: '4px 8px', 
              borderRadius: 4, 
              border: '1px solid #888', 
              background: '#222', 
              color: '#fff',
              fontSize: '12px'
            }}
          />
          {turnFilter && (
            <button
              onClick={() => setTurnFilter(null)}
              style={{ 
                padding: '2px 6px', 
                borderRadius: 4, 
                border: '1px solid #888', 
                background: '#e74c3c', 
                color: '#fff',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={() => setShowAllEntries(!showAllEntries)}
          style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 6, border: '1px solid #888', background: showAllEntries ? '#e74c3c' : '#222', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
          title={showAllEntries ? "Show recent entries only (T1 logs will be hidden)" : "Show all entries (including T1 logs)"}
        >
          {showAllEntries ? '📜 Recent Only' : '📜 Show All (T1+)'}
        </button>
        <button
          onClick={handleCopyAllLogs}
          style={{ marginLeft: '8px', padding: '6px 14px', borderRadius: 6, border: '1px solid #888', background: copied ? '#27ae60' : '#222', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
          title="Copy all logs to clipboard"
        >
          {copied ? 'Copied!' : '📋 Copy All Logs'}
        </button>
      </div>
      
      {activeTab === 'narrative' ? renderNarrativeTab() : renderAITab()}
    </div>
  );
}; 