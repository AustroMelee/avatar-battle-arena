// CONTEXT: Enhanced Battle Scene
// RESPONSIBILITY: Display comprehensive battle state with resource management and fallback moves
import React from 'react';
import { BattleState, BattleCharacter } from '../../types';
import { Ability } from '@/common/types';
import { getAvailableFallbackMoves } from '../../services/battle/fallbackMoves';
import { UnifiedBattleLog } from '../UnifiedBattleLog';
import styles from './EnhancedBattleScene.module.css';

interface EnhancedBattleSceneProps {
  battleState: BattleState;
  onMoveSelect?: (moveName: string) => void;
  isPlayerTurn?: boolean;
}

/**
 * @description Enhanced battle scene with resource bars, move availability, and comprehensive state display.
 */
export const EnhancedBattleScene: React.FC<EnhancedBattleSceneProps> = ({
  battleState
}) => {
  const [fighter1, fighter2] = battleState.participants;

  // Get available fallback moves for display
  const fighter1Fallbacks = getAvailableFallbackMoves(fighter1.currentHealth);
  const fighter2Fallbacks = getAvailableFallbackMoves(fighter2.currentHealth);

  /**
   * @description Renders a resource bar with visual feedback.
   */
  const ResourceBar: React.FC<{
    current: number;
    max: number;
    label: string;
    color: string;
    showPercentage?: boolean;
  }> = ({ current, max, label, color, showPercentage = true }) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    const isLow = percentage <= 25;
    const isCritical = percentage <= 10;

    return (
      <div className={styles.resourceBar}>
        <div className={styles.resourceLabel}>
          {label}: {current}/{max}
          {showPercentage && ` (${Math.round(percentage)}%)`}
        </div>
        <div className={styles.barContainer}>
          <div 
            className={`${styles.barFill} ${isCritical ? styles.critical : isLow ? styles.low : ''}`}
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color
            }}
          />
        </div>
      </div>
    );
  };

  /**
   * @description Renders a fighter card with comprehensive state information.
   */
  const FighterCard: React.FC<{
    fighter: BattleCharacter;
    isActive: boolean;
    isPlayer: boolean;
    fallbackMoves: Ability[];
  }> = ({ fighter, isActive, isPlayer, fallbackMoves }) => {
    const healthColor = fighter.currentHealth > 50 ? '#4CAF50' : 
                       fighter.currentHealth > 25 ? '#FF9800' : '#F44336';
    const chiColor = fighter.resources.chi > 5 ? '#2196F3' : 
                    fighter.resources.chi > 2 ? '#FF9800' : '#F44336';

    return (
      <div className={`${styles.fighterCard} ${isActive ? styles.active : ''} ${isPlayer ? styles.player : styles.enemy}`}>
        <div className={styles.fighterHeader}>
          <h3 className={styles.fighterName}>{fighter.name}</h3>
          <div className={styles.fighterBending}>{fighter.base.bending}</div>
          {isActive && <div className={styles.activeIndicator}>ACTIVE</div>}
        </div>

        <div className={styles.fighterStats}>
          <ResourceBar 
            current={fighter.currentHealth} 
            max={100} 
            label="Health" 
            color={healthColor}
          />
          <ResourceBar 
            current={fighter.resources.chi} 
            max={10} 
            label="Chi" 
            color={chiColor}
          />
          <div className={styles.defenseStat}>
            Defense: {fighter.currentDefense}
          </div>
        </div>

        <div className={styles.moveHistory}>
          <h4>Recent Moves:</h4>
          <div className={styles.moveList}>
            {fighter.moveHistory.slice(-3).map((move, index) => (
              <span key={index} className={styles.moveItem}>{move}</span>
            ))}
          </div>
        </div>

        {fallbackMoves.length > 0 && (
          <div className={styles.fallbackMoves}>
            <h4>Available Fallbacks:</h4>
            <div className={styles.fallbackList}>
              {fallbackMoves.map((move, index) => (
                <div key={index} className={styles.fallbackMove}>
                  <span className={styles.moveName}>{move.name}</span>
                  <span className={styles.movePower}>{move.power} power</span>
                  <span className={styles.moveCost}>{move.chiCost || 0} chi</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {fighter.flags?.usedDesperation && (
          <div className={styles.desperationIndicator}>
            ⚡ Desperation move used
          </div>
        )}
      </div>
    );
  };

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
        <FighterCard 
          fighter={fighter1}
          isActive={battleState.activeParticipantIndex === 0}
          isPlayer={true}
          fallbackMoves={fighter1Fallbacks}
        />
        
        <div className={styles.vsSection}>
          <div className={styles.vs}>VS</div>
          <div className={styles.location}>
            {battleState.location || 'Battle Arena'}
          </div>
        </div>
        
        <FighterCard 
          fighter={fighter2}
          isActive={battleState.activeParticipantIndex === 1}
          isPlayer={false}
          fallbackMoves={fighter2Fallbacks}
        />
      </div>

      <BattleLog />
    </div>
  );
}; 