// CONTEXT: BattleLog, // FOCUS: UIRendering
import { useEffect, useRef } from 'react';
import styles from './BattleLog.module.css';

/**
 * @description Props for the BattleLog component.
 */
export type BattleLogProps = {
  logEntries: string[];
};

/**
 * @description Renders a human-readable log of battle events, highlighting the latest entry and auto-scrolling.
 * @returns {JSX.Element} The battle log display.
 */
export function BattleLog({ logEntries }: BattleLogProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new log entries are added.
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logEntries]);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Battle Log</h3>
      <div className={styles.logListContainer} ref={logContainerRef}>
        {logEntries.map((entry, index) => (
          <div
            key={index}
            className={`${styles.logEntry} ${index === logEntries.length - 1 ? styles.latest : ''}`}
          >
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
} 