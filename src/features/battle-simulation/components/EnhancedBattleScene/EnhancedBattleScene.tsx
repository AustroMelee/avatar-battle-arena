// CONTEXT: Enhanced Battle Scene
// RESPONSIBILITY: Display comprehensive battle state with resource management and fallback moves
import React from 'react';
import { BattleState } from '../../types';
import { UnifiedBattleLog } from '../UnifiedBattleLog';
import styles from './EnhancedBattleScene.module.css';
import { CharacterStatus } from '../CharacterStatus/CharacterStatus';
import { AbilityPanel } from '../AbilityPanel/AbilityPanel';
import type { Move } from '../../types/move.types';

interface EnhancedBattleSceneProps {
  battleState: BattleState;
  onMoveSelect?: (move: Move) => void;
  isPlayerTurn?: boolean;
}

/**
 * @description Enhanced battle scene with resource bars, move availability, and comprehensive state display.
 */
export const EnhancedBattleScene: React.FC<EnhancedBattleSceneProps> = ({
  battleState,
  onMoveSelect
}) => {
  const [fighter1, fighter2] = battleState.participants;

  /**
   * @description Renders the unified battle log with tabs.
   */
  const BattleLog: React.FC = () => {
    return (
      <div className={styles.battleLog}>
        <UnifiedBattleLog 
          battleLog={battleState.battleLog}
          aiLog={battleState.aiLog}
          maxEntries={12}
          participants={battleState.participants}
        />
      </div>
    );
  };

  /**
   * @description Renders turn information and battle state.
   */
  const TurnInfo: React.FC = () => {
    const isStalemate = battleState.turn > 15;
    const isClimax = battleState.turn > 20;

    return (
      <div className={styles.turnInfo}>
        <div className={styles.turnNumber}>
          Turn {battleState.turn}
        </div>
        <div className={styles.battleStatus}>
          {battleState.isFinished ? (
            <div className={styles.battleEnd}>
              {battleState.winner ? (
                <span className={styles.victory}>🏆 {battleState.winner.name} wins!</span>
              ) : (
                <span className={styles.draw}>🤝 Battle ended in a draw</span>
              )}
            </div>
          ) : (
            <div className={styles.battleProgress}>
              {isClimax && <span className={styles.climaxWarning}>🔥 CLIMAX PHASE</span>}
              {isStalemate && !isClimax && <span className={styles.stalemateWarning}>⚠️ Stalemate detected</span>}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.enhancedBattleScene}>
      <TurnInfo />
      <div className={styles.battleArena}>
        {/* Player 1 */}
        <div>
          <CharacterStatus 
            character={fighter1}
            isActive={battleState.activeParticipantIndex === 0}
            playerColor={'var(--border-color-p1)'}
          />
          <AbilityPanel
            character={fighter1}
            isActive={battleState.activeParticipantIndex === 0}
            onAbilitySelect={onMoveSelect || (() => {})}
          />
        </div>
        <div className={styles.vsSection}>
          <div className={styles.vs}>VS</div>
          <div className={styles.location}>
            {battleState.location || 'Battle Arena'}
          </div>
        </div>
        {/* Player 2 */}
        <div>
          <CharacterStatus 
            character={fighter2}
            isActive={battleState.activeParticipantIndex === 1}
            playerColor={'var(--border-color-p2)'}
          />
          <AbilityPanel
            character={fighter2}
            isActive={battleState.activeParticipantIndex === 1}
            onAbilitySelect={onMoveSelect || (() => {})}
          />
        </div>
      </div>
      <BattleLog />
    </div>
  );
}; 