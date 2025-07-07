/*
 * @file UnifiedBattleLog.tsx
 * @description Unified battle log UI: tabs, log entries, and technical log for the Avatar Battle Arena.
 * @criticality 🎨 Battle Log
 * @owner AustroMelee
 * @lastUpdated 2025-07-08
 * @related BattleScene.tsx, TechnicalLog.tsx
 */
// CONTEXT: Unified Battle Log
// RESPONSIBILITY: Single log component with tabs for narrative and technical logs
// 
// ⚠️ CRITICAL REQUIREMENT: Turn 1 logs MUST ALWAYS be visible by default
// No matter how many updates or changes we make, users MUST be able to see logs from T1
// This is essential for battle analysis and debugging - never hide early turns!
//
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BattleLogEntry, AILogEntry, BattleCharacter } from '../../types';
import styles from './UnifiedBattleLog.module.css';
import { BattleNarrativeTurn } from '../BattleNarrativeTurn/BattleNarrativeTurn';

interface UnifiedBattleLogProps {
  battleLog: BattleLogEntry[];
  aiLog: AILogEntry[];
  maxEntries?: number;
  participants: [BattleCharacter, BattleCharacter];
}

type LogTab = 'narrative' | 'technical' | 'ai';

/**
 * @description Unified battle log with tabs for narrative and AI logs.
 */
export const UnifiedBattleLog: React.FC<UnifiedBattleLogProps> = ({
  battleLog,
  aiLog,
  maxEntries = 15,
  participants
}) => {
  // ⚠️ CRITICAL: Always start with showAllEntries = true to ensure T1 logs are visible
  // This is a hard requirement - users must always see the complete battle log by default
  const [activeTab, setActiveTab] = useState<LogTab>('narrative');
  const [copied, setCopied] = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(true); // ALWAYS TRUE BY DEFAULT
  const [turnFilter, setTurnFilter] = useState<number | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new entries are added or tab changes
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [battleLog, activeTab]);

  // Group battle log entries by turn
  const groupedBattleLog = useMemo(() => {
    return battleLog.reduce((acc, entry) => {
      (acc[entry.turn] = acc[entry.turn] || []).push(entry);
      return acc;
    }, {} as Record<number, BattleLogEntry[]>);
  }, [battleLog]);

  // const _groupedAILog = useMemo(() => {
  //   return aiLog.reduce((acc, entry) => {
  //     (acc[entry.turn] = acc[entry.turn] || []).push(entry);
  //     return acc;
  //   }, {} as Record<number, AILogEntry[]>);
  // }, [aiLog]);

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
    const turnNumbers = Object.keys(groupedBattleLog).map(Number).sort((a, b) => a - b);
    const visibleTurnNumbers = showAllEntries ? turnNumbers : turnNumbers.slice(-Math.floor(maxEntries / 2));
    if (visibleTurnNumbers.length === 0) {
      return (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>⚔️</span>
          <p>Battle log is empty</p>
        </div>
      );
    }
    if (!participants || !Array.isArray(participants) || participants.length !== 2) {
      return (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>❓</span>
          <p>Participants not loaded</p>
        </div>
      );
    }
    const [p1, p2] = participants;

    return (
      <div className={styles.tabContent} ref={logContainerRef}>
        {visibleTurnNumbers.map(turnNumber => (
          <div key={`turn-group-${turnNumber}`} className={styles.turnGroup}>
            <h4 className={styles.turnHeader}>Turn {turnNumber}</h4>
            {groupedBattleLog[turnNumber].map((entry, index) => {
              let playerSide: 'p1' | 'p2' | 'system' = 'system';
              let icon = entry.actor === 'Narrator' || entry.actor === 'System' || entry.actor === 'Environment' ? '/favicon.ico' : '';

              if (entry.actor === p1.name) {
                playerSide = 'p1';
                icon = p1.base.icon;
              } else if (entry.actor === p2.name) {
                playerSide = 'p2';
                icon = p2.base.icon;
              }

              return (
                <BattleNarrativeTurn
                  key={`${entry.id}-${index}`}
                  actor={entry.actor}
                  narrative={entry.narrative || entry.result}
                  type={entry.type}
                  playerSide={playerSide}
                  icon={icon}
                />
              )
            })}
          </div>
        ))}
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
      const chi = entry.details && entry.details.resourceCost !== undefined ? ` (${entry.details.resourceCost} chi)` : '';
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
    if (!participants || !Array.isArray(participants) || participants.length < 1) return null;
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
            🎭 Narrative
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'technical' ? styles.active : ''}`}
            onClick={() => setActiveTab('technical')}
          >
            💻 Technical
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'ai' ? styles.active : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            🤖 AI Decisions
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
      
      {activeTab === 'narrative' && renderNarrativeTab()}
      {activeTab === 'technical' && renderAITab()}
      {activeTab === 'ai' && renderAITab()}
    </div>
  );
}; 