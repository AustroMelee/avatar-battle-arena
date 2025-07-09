// Used via dynamic registry in AI engine. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: Tactical AI Decision Making
// RESPONSIBILITY: AI that considers positioning, charge-ups, and environmental factors

import { BattleCharacter } from '../../types';
import { Move, getLocationType } from '../../types/move.types';

export { selectTacticalMove } from './moveSelection'; // Now strictly phase-based

/**
 * @description Creates a tactical analysis for AI decision logging.
 */
export function createTacticalAnalysis(
  self: BattleCharacter,
  enemy: BattleCharacter,
  location: string,
  chosenMove: Move
): {
  positionAdvantage: boolean;
  chargeOpportunity: boolean;
  punishOpportunity: boolean;
  environmentalFactor: string;
} {
  const locationType = getLocationType(location);
  
  return {
    positionAdvantage: chosenMove.positionBonus?.[self.position] !== undefined,
    chargeOpportunity: !!chosenMove.isChargeUp,
    punishOpportunity: !!(chosenMove.punishIfCharging && 
      (enemy.isCharging || enemy.position === "repositioning" || enemy.position === "stunned")),
    environmentalFactor: locationType
  };
}

/**
 * @description Determines if the AI should prioritize positioning over attacking.
 */
export function shouldPrioritizePositioning(
  self: BattleCharacter,
  enemy: BattleCharacter,
  turn: number
): boolean {
  const isAirbender = self.name.toLowerCase().includes('aang');
  
  // Always reposition if cornered
  if (self.position === "cornered") {
    return true;
  }
  
  // Airbenders reposition more frequently
  if (isAirbender && turn % 3 === 0) {
    return true;
  }
  
  // Reposition if enemy is charging
  if (enemy.isCharging) {
    return true;
  }
  
  // Don't reposition too frequently
  if (self.repositionAttempts > 2) {
    return false;
  }
  
  return false;
} 