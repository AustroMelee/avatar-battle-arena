import type { BattleState, BattleCharacter } from '../../../types';
import type { Ability } from '../../../../../common/types';
import { 
  wasLastMoveShield, 
  recentDamageTaken, 
  wasRecentlyCriticallyHit,
  isSpammingMove,
  wasRecentlyBlockedOrEvaded
} from '../logQueries';

/**
 * @description Helper functions for common AI conditions
 */

// Health-based conditions
export function isLowHP(self: BattleCharacter, threshold: number = 0.3): boolean {
  return self.currentHealth < 30; // Fixed threshold for now
}

export function isCriticalHP(self: BattleCharacter, threshold: number = 0.15): boolean {
  return self.currentHealth < 15;
}

export function isEnemyLowHP(opp: BattleCharacter, threshold: number = 0.25): boolean {
  return opp.currentHealth < 25;
}

export function isEnemyCriticalHP(opp: BattleCharacter, threshold: number = 0.1): boolean {
  return opp.currentHealth < 10;
}

// Defense-based conditions
export function isEnemyDefended(opp: BattleCharacter, threshold: number = 20): boolean {
  return opp.currentDefense > threshold;
}

export function isEnemyHeavilyDefended(opp: BattleCharacter, threshold: number = 35): boolean {
  return opp.currentDefense > threshold;
}

// Resource-based conditions
export function isLowChi(self: BattleCharacter, threshold: number = 3): boolean {
  return (self.resources.chi || 0) < threshold;
}

export function isCriticalChi(self: BattleCharacter, threshold: number = 1): boolean {
  return (self.resources.chi || 0) <= threshold;
}

// Move availability conditions
export function hasMoveAvailable(self: BattleCharacter, moveName: string): boolean {
  return self.abilities.some(ability => 
    ability.name === moveName && 
    !self.cooldowns[ability.name] && 
    (self.usesLeft[ability.name] ?? (ability.maxUses || Infinity)) > 0 &&
    (self.resources.chi || 0) >= (ability.chiCost || 0)
  );
}

export function hasMoveWithTag(self: BattleCharacter, tag: string): boolean {
  return self.abilities.some(ability => 
    ability.tags?.includes(tag) && 
    !self.cooldowns[ability.name] && 
    (self.usesLeft[ability.name] ?? (ability.maxUses || Infinity)) > 0 &&
    (self.resources.chi || 0) >= (ability.chiCost || 0)
  );
}

export function hasPiercingMove(self: BattleCharacter): boolean {
  return hasMoveWithTag(self, 'piercing');
}

export function hasHealingMove(self: BattleCharacter): boolean {
  return hasMoveWithTag(self, 'healing');
}

export function hasDesperateMove(self: BattleCharacter): boolean {
  return hasMoveWithTag(self, 'desperate');
}

export function hasHighDamageMove(self: BattleCharacter): boolean {
  return hasMoveWithTag(self, 'high-damage');
}

// Move history conditions
export function didEnemyJustUse(opp: BattleCharacter, moveName: string): boolean {
  return opp.lastMove === moveName;
}

export function didEnemyJustShield(opp: BattleCharacter): boolean {
  return !!(opp.lastMove?.toLowerCase().includes('shield') || 
         opp.lastMove?.toLowerCase().includes('defense') ||
         opp.lastMove?.toLowerCase().includes('recovery'));
}

// Enhanced battle log-based conditions
export function didEnemyJustShieldFromLog(state: BattleState, opp: BattleCharacter): boolean {
  return wasLastMoveShield(state.battleLog, opp.name);
}

export function hasTakenRecentDamage(state: BattleState, self: BattleCharacter, threshold: number = 15): boolean {
  return recentDamageTaken(state.battleLog, self.name, 2) >= threshold;
}

export function wasRecentlyCriticallyHitFromLog(state: BattleState, self: BattleCharacter): boolean {
  return wasRecentlyCriticallyHit(state.battleLog, self.name, 2);
}

export function isEnemySpammingMove(state: BattleState, opp: BattleCharacter): string | null {
  return isSpammingMove(state.battleLog, opp.name, 2, 3);
}

export function wasRecentlyBlockedOrEvadedFromLog(state: BattleState, self: BattleCharacter): boolean {
  return wasRecentlyBlockedOrEvaded(state.battleLog, self.name, 2);
}

export function hasUsedMoveRecently(self: BattleCharacter, moveName: string, turns: number = 3): boolean {
  return self.moveHistory.slice(-turns).includes(moveName);
}

// Battle state conditions
export function isEarlyGame(state: BattleState): boolean {
  return state.turn < 5;
}

export function isMidGame(state: BattleState): boolean {
  return state.turn >= 5 && state.turn < 10;
}

export function isLateGame(state: BattleState): boolean {
  return state.turn >= 10;
}

export function isWinning(self: BattleCharacter, opp: BattleCharacter): boolean {
  return self.currentHealth > opp.currentHealth + 20;
}

export function isLosing(self: BattleCharacter, opp: BattleCharacter): boolean {
  return opp.currentHealth > self.currentHealth + 20;
}

// Move selection helpers
export function getAvailableMoves(self: BattleCharacter): Ability[] {
  return self.abilities.filter(ability => 
    !self.cooldowns[ability.name] && 
    (self.usesLeft[ability.name] ?? (ability.maxUses || Infinity)) > 0 &&
    (self.resources.chi || 0) >= (ability.chiCost || 0)
  );
}

export function getMoveByName(self: BattleCharacter, moveName: string): Ability | null {
  const availableMoves = getAvailableMoves(self);
  return availableMoves.find(move => move.name === moveName) || null;
}

export function getMoveWithTag(self: BattleCharacter, tag: string): Ability | null {
  const availableMoves = getAvailableMoves(self);
  return availableMoves.find(move => move.tags?.includes(tag)) || null;
}

export function getHighestDamageMove(self: BattleCharacter): Ability | null {
  const availableMoves = getAvailableMoves(self);
  if (availableMoves.length === 0) return null;
  
  return availableMoves.reduce((best, current) => 
    current.power > best.power ? current : best
  );
}

export function getLowestCostMove(self: BattleCharacter): Ability | null {
  const availableMoves = getAvailableMoves(self);
  if (availableMoves.length === 0) return null;
  
  return availableMoves.reduce((best, current) => 
    (current.chiCost || 0) < (best.chiCost || 0) ? current : best
  );
} 