// CONTEXT: BattleSimulation, // FOCUS: UIRendering
import { PlayerCardHorizontal } from '../PlayerCardHorizontal/PlayerCardHorizontal';
import { PlayerCardHorizontalProps } from '../../types';
import styles from './VersusGrid.module.css';

/**
 * @description Props for the VersusGrid component.
 */
export type VersusGridProps = {
  player1: PlayerCardHorizontalProps;
  player2: PlayerCardHorizontalProps;
};

/**
 * @description Renders a horizontal versus layout with two player cards and a VS divider.
 * @returns {JSX.Element} The versus grid UI.
 */
export function VersusGrid({ player1, player2 }: VersusGridProps) {
  return (
    <div className={styles.versusGrid}>
      <div className={styles.playerColumn}>
        <PlayerCardHorizontal {...player1} />
      </div>
      <div className={styles.vsDivider}>
        <span className={styles.vsText}>VS</span>
      </div>
      <div className={styles.playerColumn}>
        <PlayerCardHorizontal {...player2} />
      </div>
    </div>
  );
} 