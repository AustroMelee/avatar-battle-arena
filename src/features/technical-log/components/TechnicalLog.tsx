// CONTEXT: TechnicalLog, // FOCUS: UIRendering
import styles from './TechnicalLog.module.css';

/**
 * @description Props for the TechnicalLog component.
 */
export type TechnicalLogProps = {
  logEntries: string[];
};

/**
 * @description Renders a technical/AI-level log for debugging.
 * @returns {JSX.Element} The technical log display.
 */
export function TechnicalLog({ logEntries }: TechnicalLogProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>AI/Technical Log</h3>
      <pre className={styles.logContent}>
        <code>
          {logEntries.join('\n')}
        </code>
      </pre>
    </div>
  );
} 