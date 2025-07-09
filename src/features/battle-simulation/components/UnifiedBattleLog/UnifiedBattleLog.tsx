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
import React, { useState, useRef, useEffect, FC } from 'react';
import { BattleLogEntry, AILogEntry, BattleCharacter } from '../../types';
import { LogViewMode } from '../../types/logViewModes';
import DialogueLogEntry from './DialogueLogEntry';
import NarrativeLogEntry from './NarrativeLogEntry';
import TechnicalLogEntry from './TechnicalLogEntry';

interface UnifiedBattleLogProps {
  battleLog: BattleLogEntry[];
  aiLog: AILogEntry[];
  maxEntries?: number;
  participants: [BattleCharacter, BattleCharacter];
}

type LogTab = 'narrative' | 'technical';

/**
 * @description UnifiedBattleLog enforces that participants[0] is always Player 1 (left) and participants[1] is Player 2 (right).
 * If the log entries suggest the order is reversed (e.g., Player 2 acts first), the component will auto-swap participants for rendering
 * and log a warning. This guarantees left/right consistency in the UI regardless of upstream bugs or input order.
 */
// Minimal TurnGroup component
function TurnGroup({ turn, entries, p1Name, p2Name }: { turn: string | number, entries: BattleLogEntry[], p1Name: string, p2Name: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {turn !== 'Prologue' && (
        <div style={{ fontWeight: 700, fontSize: 18, margin: '0 0 8px 0', color: '#cbd5e1', textAlign: 'left' }}>Turn {turn}</div>
      )}
      {entries.map((entry, i) => (
        <SingleLogEntry key={entry.id || i} entry={entry} p1Name={p1Name} p2Name={p2Name} />
      ))}
    </div>
  );
}

// Minimal SingleLogEntry component
const PLACEHOLDER_STRINGS = ["escalation", "Reversal", "", null, undefined];

function isRenderableLogEntry(entry: BattleLogEntry) {
  const text = typeof entry.narrative === 'string'
    ? entry.narrative
    : Array.isArray(entry.narrative)
      ? entry.narrative.join(' ')
      : (entry.action || entry.result || '');
  if (!text || PLACEHOLDER_STRINGS.includes(text)) return false;
  return true;
}

function assertNever(x: never): never {
  /* istanbul ignore next */
  throw new Error(`Unhandled log type: ${JSON.stringify(x)}`);
}

type Props = {
  entry: BattleLogEntry;
  p1Name: string;
  p2Name: string;
};

export const SingleLogEntry: FC<Props> = ({ entry, p1Name, p2Name }) => {
  const common = { id: entry.id, ts: entry.timestamp };
  switch (entry.type) {
    case "dialogue":
      if (entry.actor === p1Name || entry.actor === p2Name) {
        return (
          <DialogueLogEntry
            {...common}
            actor={entry.actor}
            text={typeof entry.narrative === 'string' ? entry.narrative : Array.isArray(entry.narrative) ? entry.narrative.join(' ') : ''}
            align={entry.actor === p1Name ? "left" : "right"}
          />
        );
      }
      return (
        <NarrativeLogEntry
          {...common}
          text={typeof entry.narrative === 'string' ? entry.narrative : Array.isArray(entry.narrative) ? entry.narrative.join(' ') : ''}
        />
      );
    case "narrative":
    case "mechanics":
    case "system":
      if (
        ((import.meta as { env?: { MODE?: string } }).env?.MODE !== "production")
      ) {
        if (entry.actor === p1Name || entry.actor === p2Name) {
          console.warn("[LOG PIPELINE] Non-dialogue fighter entry:", entry);
        }
      }
      return (
        <NarrativeLogEntry
          {...common}
          text={(() => {
            if (typeof entry.narrative === 'string') return entry.narrative;
            if (Array.isArray(entry.narrative)) return entry.narrative.join(' ');
            const fallback = (entry as { narrative?: string | string[] }).narrative;
            if (typeof fallback === 'string') return fallback;
            if (Array.isArray(fallback)) return fallback.join(' ');
            return '';
          })()}
        />
      );
    default:
      return assertNever(entry as never);
  }
};

export const UnifiedBattleLog: React.FC<UnifiedBattleLogProps> = ({
  battleLog,
  aiLog,
  participants
}) => {
  let [p1, p2] = participants;
  if (battleLog.length > 0) {
    const firstEntry = battleLog.find(e => e.actor === p1.name || e.actor === p2.name);
    if (firstEntry) {
      if (firstEntry.actor === p2.name) {
        [p1, p2] = [p2, p1];
        console.warn('[UnifiedBattleLog] Detected participants order mismatch. Swapping for left/right consistency.');
      }
    }
  }
  // ⚠️ CRITICAL: Always start with showAllEntries = true to ensure T1 logs are visible
  // This is a hard requirement - users must always see the complete battle log by default
  const [activeTab, setActiveTab] = useState<LogTab>('narrative');
  const [copied, setCopied] = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(true); // ALWAYS TRUE BY DEFAULT
  const [turnFilter, setTurnFilter] = useState<number | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Log view mode state
  const [viewMode, setViewMode] = useState<LogViewMode>('grouped');

  // CRITICAL INVARIANT: Logs must always be sorted by turn for correct UI and analytics.
  function groupEntriesByTurn(entries: BattleLogEntry[]) {
    const grouped: { prologue: BattleLogEntry[]; turns: { turn: number, entries: BattleLogEntry[] }[] } = { prologue: [], turns: [] };
    const turnMap: Record<number, BattleLogEntry[]> = {};
    for (const e of entries) {
      if (e.turn === 0 || e.turn === undefined) grouped.prologue.push(e);
      else {
        if (!turnMap[e.turn]) turnMap[e.turn] = [];
        turnMap[e.turn].push(e);
      }
    }
    grouped.turns = Object.entries(turnMap)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([turn, entries]) => ({ turn: Number(turn), entries }));
    return grouped;
  }

  // Determine which modes to show
  const viteMode = (import.meta as { env?: { MODE?: string } }).env?.MODE || 'development';
  const showDevModes = viteMode !== "production";
  const logViewModes = showDevModes
    ? [
        { value: "grouped", label: "[DEV] Grouped by Turn – Full battle transcript" },
        { value: "latest", label: "[DEV] Latest Turn Only – Just current turn" },
        { value: "full", label: "[DEV] All Entries (Raw) – Unfiltered log" },
        { value: "public", label: "[PUBLIC] Story View – For players/spectators" }
      ]
    : [
        { value: "public", label: "[PUBLIC] Story View – For players/spectators" }
      ];

  // Render logic based on viewMode
  let logContent: React.ReactNode = null;
  if (battleLog.length === 0) {
    logContent = <div style={{ color: "#64748b" }}>No log yet. Start a battle!</div>;
  } else {
    switch (viewMode) {
      case 'latest': {
        const maxTurn = Math.max(...battleLog.map(e => e.turn ?? 0));
        const latest = battleLog.filter(e => e.turn === maxTurn);
        logContent = <TurnGroup turn={maxTurn} entries={latest} p1Name={p1.name} p2Name={p2.name} />;
        break;
      }
      case 'grouped': {
        const grouped = groupEntriesByTurn(battleLog);
        logContent = <>
          {grouped.prologue.length > 0 && (
            <TurnGroup turn="Prologue" entries={grouped.prologue} p1Name={p1.name} p2Name={p2.name} />
          )}
          {grouped.turns.map(({ turn, entries }) => (
            <TurnGroup key={turn} turn={turn} entries={entries} p1Name={p1.name} p2Name={p2.name} />
          ))}
        </>;
        break;
      }
      case 'public': {
        // For now, [PUBLIC] mode is same as grouped; can customize later
        const grouped = groupEntriesByTurn(battleLog);
        logContent = <>
          {grouped.prologue.length > 0 && (
            <TurnGroup turn="Prologue" entries={grouped.prologue} p1Name={p1.name} p2Name={p2.name} />
          )}
          {grouped.turns.map(({ turn, entries }) => (
            <TurnGroup key={turn} turn={turn} entries={entries} p1Name={p1.name} p2Name={p2.name} />
          ))}
        </>;
        break;
      }
      case 'full':
      default: {
        logContent = battleLog.map((e, i) => <SingleLogEntry key={e.id || i} entry={e} p1Name={p1.name} p2Name={p2.name} />);
        break;
      }
    }
  }

  // Auto-scroll to the bottom when new entries are added or tab changes
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [battleLog, activeTab]);

  /**
   * @description Renders the narrative/battle log tab.
   * ⚠️ CRITICAL: This function MUST always show T1 logs by default
   * The showAllEntries state should default to true to ensure complete visibility
   */
  const renderNarrativeTab = () => {
    return (
      <div ref={logContainerRef}>
        {battleLog.filter(isRenderableLogEntry).map((entry, i) => (
          <SingleLogEntry key={entry.id || i} entry={entry} p1Name={p1.name} p2Name={p2.name} />
        ))}
      </div>
    );
  };

  /**
   * @description Renders the AI log tab.
   */
  const renderAITab = () => {
    if (!aiLog || aiLog.length === 0) {
      return <div style={{ padding: '8px', color: '#888' }}>No technical log entries.</div>;
    }
    return (
      <div ref={logContainerRef}>
        {aiLog.map((entry, idx) => {
          const text = entry.reasoning || entry.narrative || '';
          return <TechnicalLogEntry key={`${entry.turn}-${entry.agent}-${idx}`} text={text} title="System" turn={entry.turn} />;
        })}
      </div>
    );
  };

  /**
   * @description Formats all logs for clipboard copying.
   */
  const formatAllLogsForClipboard = () => {
    // Story Log (narrative)
    const storyLogText = battleLog.map(entry => {
      const turn = `T${entry.turn}`;
      const actor = entry.actor;
      const narrative = entry.narrative || entry.action || entry.result || '';
      return `${turn} ${actor}: ${narrative}`.trim();
    }).join('\n');

    // Technical Log (AI)
    const technicalLogText = aiLog.map(entry => {
      const turn = `T${entry.turn}`;
      const agent = entry.agent;
      const chosen = entry.chosenAction ? `Chose ${entry.chosenAction}` : '';
      const reason = entry.reasoning ? `Reason: ${entry.reasoning}` : '';
      return `${turn} ${agent}: ${chosen}${reason ? '. ' + reason : ''}`.trim();
    }).join('\n');

    // If you have a distinct battle log, add it here. Otherwise, just include story and technical logs.
    return (
      '=== Story Log ===\n' +
      storyLogText +
      '\n\n=== Technical Log ===\n' +
      technicalLogText
    );
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
    } catch {
      // fallback: do nothing
    }
  };

  /**
   * @description Formats only the narrative log for clipboard copying.
   */
  const formatNarrativeLogForClipboard = () => {
    return battleLog.map(entry => {
      const turn = `T${entry.turn}`;
      const actor = entry.actor;
      // Prefer narrative, fallback to action/result
      const narrative = entry.narrative || entry.action || entry.result || '';
      return `${turn} ${actor}: ${narrative}`.trim();
    }).join('\n');
  };

  /**
   * @description Formats only the technical log for clipboard copying.
   */
  const formatTechnicalLogForClipboard = () => {
    return aiLog.map(entry => {
      const turn = `T${entry.turn}`;
      const agent = entry.agent;
      const chosen = entry.chosenAction ? `Chose ${entry.chosenAction}` : '';
      const reason = entry.reasoning ? `Reason: ${entry.reasoning}` : '';
      return `${turn} ${agent}: ${chosen}${reason ? '. ' + reason : ''}`.trim();
    }).join('\n');
  };

  /**
   * @description Handles copying only the narrative log to clipboard.
   */
  const handleCopyNarrativeLog = async () => {
    const text = formatNarrativeLogForClipboard();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback: do nothing
    }
  };

  /**
   * @description Handles copying only the technical log to clipboard.
   */
  const handleCopyTechnicalLog = async () => {
    const text = formatTechnicalLogForClipboard();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback: do nothing
    }
  };

  // Disruption state ticker (shows after each turn)
  const renderDisruptionTicker = () => {
    if (!participants || !Array.isArray(participants) || participants.length < 1) return null;
    return (
      <div className="disruptionTicker" aria-label="Disruption State Ticker">
        {participants.map((char) => (
          <span key={char.name}
            aria-label={`${char.name} Control State: ${char.controlState}, Stability: ${char.stability}, Momentum: ${char.momentum}`}
            style={{ marginRight: 12, fontWeight: 500 }}
          >
            <strong>{char.name}</strong>: {char.controlState} | S:{char.stability} | M:{char.momentum}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="unifiedBattleLog">
      {renderDisruptionTicker()}
      <div className="header" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 20 }}>Battle Log</h3>
        <div className="tabSelector" style={{ display: 'flex', gap: 4 }}>
          <button
            style={{ fontWeight: activeTab === 'narrative' ? 700 : 400, padding: '4px 10px', borderRadius: 4, border: '1px solid #888', background: activeTab === 'narrative' ? '#222' : '#444', color: '#fff', cursor: 'pointer' }}
            onClick={() => setActiveTab('narrative')}
          >
            🎭 Narrative
          </button>
          <button
            style={{ fontWeight: activeTab === 'technical' ? 700 : 400, padding: '4px 10px', borderRadius: 4, border: '1px solid #888', background: activeTab === 'technical' ? '#222' : '#444', color: '#fff', cursor: 'pointer' }}
            onClick={() => setActiveTab('technical')}
          >
            💻 Technical
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
          <input
            type="number"
            placeholder="Turn #"
            min="1"
            max={Number.isFinite(Math.max(...battleLog.map(e => e.turn))) ? Math.max(...battleLog.map(e => e.turn), 1) : 1}
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
          aria-label="Copy All Logs"
        >
          {copied ? 'Copied!' : 'Copy All Logs'}
        </button>
        <button
          onClick={handleCopyNarrativeLog}
          style={{ marginLeft: '8px', padding: '6px 14px', borderRadius: 6, border: '1px solid #888', background: copied ? '#27ae60' : '#222', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
          title="Copy only the story (narrative) log"
          aria-label="Copy Story Log"
        >
          Copy Story Log
        </button>
        <button
          onClick={handleCopyTechnicalLog}
          style={{ marginLeft: '8px', padding: '6px 14px', borderRadius: 6, border: '1px solid #888', background: copied ? '#27ae60' : '#222', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
          title="Copy only the technical (AI) log"
          aria-label="Copy Technical Log"
        >
          Copy Technical Log
        </button>
      </div>
      {/* DROPDOWN IS NOW AT TOP */}
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="log-view-mode" style={{ color: '#cbd5e1', marginRight: 8 }}>Log View:</label>
        <select id="log-view-mode" value={viewMode} onChange={e => setViewMode(e.target.value as LogViewMode)}>
          {logViewModes.map(mode => (
            <option key={mode.value} value={mode.value}>{mode.label}</option>
          ))}
        </select>
      </div>
      {/* NOW: all log rendering below */}
      {activeTab === 'narrative' && renderNarrativeTab()}
      {activeTab === 'technical' && renderAITab()}
      {logContent}
    </div>
  );
}; 