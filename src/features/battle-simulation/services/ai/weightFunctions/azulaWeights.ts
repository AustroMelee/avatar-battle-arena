// CONTEXT: AI, // FOCUS: AzulaWeights
import type { BattleCharacter } from '../../../types';
import type { WeightFunction } from '../weightedChoice';
import { 
  recentDamageTaken, 
  wasRecentlyCriticallyHit, 
  wasLastMoveShield,
  getCurrentCombo
} from '../logQueries';

/**
 * @description Azula's weight functions - aggressive, tactical, and ruthless
 */

// Lightning - High damage, high priority when safe
export const lightningWeight: WeightFunction = (_state, self, opp) => {
  // Check availability
  if (self.cooldowns['Lightning'] || (self.resources.chi || 0) < 5) return 0;
  
  let weight = 8; // Base weight
  
  // Bonus for finishing moves
  if (opp.currentHealth < 15) weight += 6;
  
  // Bonus when enemy is not heavily defended
  if (opp.currentDefense < 25) weight += 4;
  
  // Bonus for countering shields
  if (wasLastMoveShield(_state.battleLog, opp.name)) weight += 5;
  
  // Penalty if recently blocked
  if (_state.battleLog.some(entry => 
    entry.actor === self.name && 
    entry.turn >= _state.turn - 2 && 
    entry.meta?.blocked
  )) weight -= 3;
  
  return Math.max(0, weight);
};

// Firebomb - High damage, good for pressure
export const firebombWeight: WeightFunction = (_state, self, opp) => {
  if (self.cooldowns['Firebomb'] || (self.resources.chi || 0) < 4) return 0;
  
  let weight = 6;
  
  // Bonus for high damage potential
  if (opp.currentHealth > 30) weight += 3;
  
  // Bonus when winning
  if (self.currentHealth > opp.currentHealth + 10) weight += 2;
  
  // Bonus for combo potential
  const combo = getCurrentCombo(_state.battleLog, self.name);
  if (combo > 0) weight += combo;
  
  return Math.max(0, weight);
};

// Blue Fire - Reliable damage
export const blueFireWeight: WeightFunction = (_state, self, opp) => {
  if (self.cooldowns['Blue Fire'] || (self.resources.chi || 0) < 2) return 0;
  
  let weight = 5;
  
  // Bonus for finishing
  if (opp.currentHealth < 10) weight += 4;
  
  // Bonus when chi is low (conservative choice)
  if ((self.resources.chi || 0) < 4) weight += 3;
  
  // Bonus for consistency
  if (self.currentHealth > 50) weight += 2;
  
  return Math.max(0, weight);
};

// Fire Jets - Defensive option
export const fireJetsWeight: WeightFunction = (_state, self, opp) => {
  if (self.cooldowns['Fire Jets'] || (self.resources.chi || 0) < 3) return 0;
  
  let weight = 3;
  
  // High priority when health is low
  if (self.currentHealth < 25) weight += 8;
  
  // High priority when recently damaged
  if (recentDamageTaken(_state.battleLog, self.name, 2) > 15) weight += 6;
  
  // High priority when critically hit
  if (wasRecentlyCriticallyHit(_state.battleLog, self.name, 2)) weight += 5;
  
  // Bonus when enemy is aggressive
  if (recentDamageTaken(_state.battleLog, self.name, 1) > 10) weight += 4;
  
  // Penalty when winning comfortably
  if (self.currentHealth > opp.currentHealth + 20) weight -= 2;
  
  return Math.max(0, weight);
};

// Phoenix Recovery - Healing when desperate
export const phoenixRecoveryWeight: WeightFunction = (_state, self, opp) => {
  if (self.cooldowns['Phoenix Recovery'] || (self.resources.chi || 0) < 4) return 0;
  
  let weight = 2;
  
  // High priority when critically wounded
  if (self.currentHealth < 15) weight += 10;
  
  // High priority when recently damaged heavily
  if (recentDamageTaken(_state.battleLog, self.name, 2) > 20) weight += 8;
  
  // Bonus when chi is available
  if ((self.resources.chi || 0) > 6) weight += 3;
  
  // Penalty when enemy is also low
  if (opp.currentHealth < 20) weight -= 3;
  
  // Penalty when winning
  if (self.currentHealth > opp.currentHealth + 15) weight -= 4;
  
  return Math.max(0, weight);
};

// Desperate moves - when all else fails
export const desperateMovesWeight: WeightFunction = (_state, self, opp) => {
  // Check for any desperate moves available
  const desperateMoves = self.abilities.filter(ability => 
    ability.tags?.includes('desperate') &&
    !self.cooldowns[ability.name] &&
    (self.resources.chi || 0) >= (ability.chiCost || 0)
  );
  
  if (desperateMoves.length === 0) return 0;
  
  let weight = 1;
  
  // High priority when health is very low
  if (self.currentHealth < 20) weight += 7;
  
  // High priority when losing badly
  if (opp.currentHealth > self.currentHealth + 30) weight += 5;
  
  // Bonus when enemy is also low (gambling)
  if (opp.currentHealth < 25) weight += 3;
  
  return Math.max(0, weight);
};

/**
 * @description Get all weighted moves for Azula
 * @param {BattleCharacter} self - Azula's character data
 * @returns {Array<{id: string, move: Ability, weightFn: WeightFunction, description: string}>} Weighted moves
 */
export function getAzulaWeightedMoves(self: BattleCharacter) {
  return [
    {
      id: 'lightning',
      move: self.abilities.find(a => a.name === 'Lightning')!,
      weightFn: lightningWeight,
      description: 'High damage, counter shields'
    },
    {
      id: 'firebomb',
      move: self.abilities.find(a => a.name === 'Firebomb')!,
      weightFn: firebombWeight,
      description: 'Pressure damage, combo potential'
    },
    {
      id: 'blueFire',
      move: self.abilities.find(a => a.name === 'Blue Fire')!,
      weightFn: blueFireWeight,
      description: 'Reliable damage, conservative'
    },
    {
      id: 'fireJets',
      move: self.abilities.find(a => a.name === 'Fire Jets')!,
      weightFn: fireJetsWeight,
      description: 'Defensive, health protection'
    },
    {
      id: 'phoenixRecovery',
      move: self.abilities.find(a => a.name === 'Phoenix Recovery')!,
      weightFn: phoenixRecoveryWeight,
      description: 'Healing when desperate'
    }
  ].filter(item => item.move); // Filter out undefined moves
} 