// CONTEXT: BattleSimulation, // FOCUS: UIRendering
// 
// ⚠️ CRITICAL REQUIREMENT: Battle log MUST always show T1 logs by default
// The UnifiedBattleLog component defaults to showAllEntries=true to ensure T1 visibility
// This is essential for battle analysis and debugging - never change this default!
//
import { BattleState } from '../../types';
import { VersusGrid } from '../VersusGrid/VersusGrid';
import { UnifiedBattleLog } from '../UnifiedBattleLog';
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
        {/* ⚠️ CRITICAL: UnifiedBattleLog defaults to showAllEntries=true to ensure T1 logs are always visible */}
        <UnifiedBattleLog 
          battleLog={state.battleLog}
          aiLog={state.aiLog}
          maxEntries={100}
          participants={state.participants}
        />
      </div>
    </div>
  );
} 