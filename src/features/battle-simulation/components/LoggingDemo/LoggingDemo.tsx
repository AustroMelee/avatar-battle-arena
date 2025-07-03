// CONTEXT: BattleSimulation, // FOCUS: LoggingDemo
import { useState } from 'react';
import { BattleLog } from '../../../battle-log/components/BattleLog';
import { TechnicalLog } from '../../../technical-log/components/TechnicalLog';
import { LogDetailSelector } from '../../../battle-log/components/LogDetailSelector';
import { LogDetailLevel } from '../../types';
import styles from './LoggingDemo.module.css';

import { BattleState } from '../../types';

/**
 * @description Props for the LoggingDemo component.
 */
export type LoggingDemoProps = {
  battleState: BattleState | null;
};

/**
 * @description A comprehensive demo component showcasing all logging features.
 * @returns {JSX.Element} The logging demo display.
 */
export function LoggingDemo({ battleState }: LoggingDemoProps) {
  const [selectedTab, setSelectedTab] = useState<'battle' | 'ai' | 'side-by-side'>('battle');
  const [battleLogLevel, setBattleLogLevel] = useState<LogDetailLevel>('battle');

  if (!battleState) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h3>Logging Demo</h3>
          <p>Start a battle to see the comprehensive logging system in action!</p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📜</span>
              <div>
                <h4>Battle Logs</h4>
                <p>Structured battle events with narrative elements</p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🤖</span>
              <div>
                <h4>AI Decision Logs</h4>
                <p>Complete AI introspection and decision analysis</p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📋</span>
              <div>
                <h4>Copyable Logs</h4>
                <p>One-click copying for sharing and analysis</p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>⚙️</span>
              <div>
                <h4>Detail Levels</h4>
                <p>Toggle between narrative, battle, AI, and full detail modes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Comprehensive Logging System</h3>
        <div className={styles.tabSelector}>
          <button
            className={`${styles.tab} ${selectedTab === 'battle' ? styles.active : ''}`}
            onClick={() => setSelectedTab('battle')}
          >
            📜 Battle Log
          </button>
          <button
            className={`${styles.tab} ${selectedTab === 'ai' ? styles.active : ''}`}
            onClick={() => setSelectedTab('ai')}
          >
            🤖 AI Decisions
          </button>
          <button
            className={`${styles.tab} ${selectedTab === 'side-by-side' ? styles.active : ''}`}
            onClick={() => setSelectedTab('side-by-side')}
          >
            📊 Side by Side
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {selectedTab === 'battle' && (
          <div className={styles.battleLogSection}>
            <div className={styles.sectionHeader}>
              <h4>Battle Log with Detail Controls</h4>
              <LogDetailSelector
                currentLevel={battleLogLevel}
                onLevelChange={setBattleLogLevel}
                showAIOption={battleState.aiLog?.length > 0}
              />
            </div>
            <BattleLog
              logEntries={battleState.log || []}
              battleLog={battleState.battleLog || []}
              aiLog={battleState.aiLog || []}
              detailLevel={battleLogLevel}
              showCopyButton={true}
            />
          </div>
        )}

        {selectedTab === 'ai' && (
          <div className={styles.aiLogSection}>
            <h4>AI Decision Analysis</h4>
            <TechnicalLog
              aiLog={battleState.aiLog || []}
              showCopyButton={true}
            />
          </div>
        )}

        {selectedTab === 'side-by-side' && (
          <div className={styles.sideBySideSection}>
            <div className={styles.column}>
              <h4>Battle Events</h4>
              <BattleLog
                logEntries={battleState.log || []}
                battleLog={battleState.battleLog || []}
                detailLevel="battle"
                showCopyButton={false}
              />
            </div>
            <div className={styles.column}>
              <h4>AI Decisions</h4>
              <TechnicalLog
                aiLog={battleState.aiLog || []}
                showCopyButton={false}
              />
            </div>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h4>Logging Features:</h4>
        <ul>
          <li><strong>Battle Logs:</strong> Structured events with turn numbers, actors, actions, and results</li>
          <li><strong>AI Decision Logs:</strong> Complete introspection showing perceived state, considered actions, and reasoning</li>
          <li><strong>Copyable Format:</strong> One-click copying for sharing battle replays and AI analysis</li>
          <li><strong>Detail Levels:</strong> Toggle between narrative, battle, AI, and complete detail modes</li>
          <li><strong>Expandable Sections:</strong> Click on AI decisions to see full analysis</li>
        </ul>
      </div>
    </div>
  );
} 