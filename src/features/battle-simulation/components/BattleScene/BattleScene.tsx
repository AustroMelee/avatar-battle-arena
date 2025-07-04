// CONTEXT: BattleSimulation, // FOCUS: UIRendering
import { BattleLog } from '@/features/battle-log/components/BattleLog';
import { BattleState } from '../../types';
import { VersusGrid } from '../VersusGrid/VersusGrid';
import type { TriggeredNarrative } from '../../services/narrative/types';
import styles from './BattleScene.module.css';

/**
 * @description Props for the BattleScene component.
 */
export type BattleSceneProps = {
  state: BattleState;
  onPlayerChange?: (playerIndex: number) => void;
  narratives?: TriggeredNarrative[];
  onNarrativeComplete?: (narrativeId: string) => void;
};

/**
 * @description Renders the main battle screen with horizontal versus cards and the battle log.
 * @returns {JSX.Element} The battle scene UI.
 */
export function BattleScene({ 
  state, 
  onPlayerChange
}: BattleSceneProps) {
  const [player1, player2] = state.participants;

  const player1Props = {
    character: player1,
    isActive: state.activeParticipantIndex === 0 && !state.isFinished,
    playerColor: "var(--border-color-p1)",
    onChange: onPlayerChange ? () => onPlayerChange(0) : undefined
  };

  const player2Props = {
    character: player2,
    isActive: state.activeParticipantIndex === 1 && !state.isFinished,
    playerColor: "var(--border-color-p2)",
    onChange: onPlayerChange ? () => onPlayerChange(1) : undefined
  };

  return (
    <div className={styles.container}>
      {state.isFinished && state.winner && (
        <div className={styles.winnerOverlay}>
          <h2>{state.winner.name} Wins!</h2>
        </div>
      )}
      <VersusGrid player1={player1Props} player2={player2Props} />
      <div className={styles.logContainer}>
        <BattleLog 
          logEntries={state.log} 
          battleLog={state.battleLog}
          aiLog={state.aiLog}
          detailLevel="battle"
          showCopyButton={true}
        />
      </div>
    </div>
  );
} 