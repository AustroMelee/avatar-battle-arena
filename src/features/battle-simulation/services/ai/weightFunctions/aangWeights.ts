// CONTEXT: AI, // FOCUS: AangWeights
import type { BattleCharacter } from '../../../types';
import type { WeightFunction } from '../weightedChoice';
import { 
  recentDamageTaken, 
  wasRecentlyCriticallyHit, 
  wasLastMoveShield
} from '../logQueries';

/**
 * @description Aang's weight functions - defensive, evasive, and pacifist
 */

// Air Shield - Primary defensive move
export const airShieldWeight: WeightFunction = (_state, self, opp, log) => {
  if (self.cooldowns['Air Shield'] || (self.resources.chi || 0) < 3) return 0;
  
  let weight = 6; // High base weight for defensive play
  
  // High priority when health is low
  if (self.currentHealth < 30) weight += 8;
  
  // High priority when recently damaged
  if (recentDamageTaken(log, self.name, 2) > 12) weight += 6;
  
  // High priority when critically hit
  if (wasRecentlyCriticallyHit(log, self.name, 2)) weight += 7;
  
  // Bonus when enemy is aggressive
  if (recentDamageTaken(log, self.name, 1) > 8) weight += 4;
  
  // Bonus when enemy has high damage potential
  if (opp.currentHealth > 60) weight += 3;
  
  // Penalty when winning comfortably
  if (self.currentHealth > opp.currentHealth + 25) weight -= 3;
  
  return Math.max(0, weight);
};

// Air Blast - Reliable damage, good for pressure
export const airBlastWeight: WeightFunction = (_state, self, opp, log) => {
  if (self.cooldowns['Air Blast'] || (self.resources.chi || 0) < 2) return 0;
  
  let weight = 5;
  
  // Bonus for finishing moves
  if (opp.currentHealth < 15) weight += 5;
  
  // Bonus when enemy is not heavily defended
  if (opp.currentDefense < 20) weight += 3;
  
  // Bonus for countering after defense
  if (wasLastMoveShield(log, self.name)) weight += 4;
  
  // Bonus when health is good (safe to attack)
  if (self.currentHealth > 50) weight += 3;
  
  // Penalty when health is low (should defend)
  if (self.currentHealth < 25) weight -= 2;
  
  return Math.max(0, weight);
};

// Wind Slice - Piercing damage
export const windSliceWeight: WeightFunction = (_state, self, opp, log) => {
  if (self.cooldowns['Wind Slice'] || (self.resources.chi || 0) < 4) return 0;
  
  let weight = 4;
  
  // High priority against defended enemies
  if (opp.currentDefense > 25) weight += 6;
  
  // High priority for countering shields
  if (wasLastMoveShield(log, opp.name)) weight += 5;
  
  // Bonus for finishing
  if (opp.currentHealth < 20) weight += 4;
  
  // Bonus when winning (press advantage)
  if (self.currentHealth > opp.currentHealth + 15) weight += 3;
  
  // Penalty when health is low
  if (self.currentHealth < 30) weight -= 2;
  
  return Math.max(0, weight);
};

// Air Scooter - Evasive and mobile
export const airScooterWeight: WeightFunction = (_state, self, opp, log) => {
  if (self.cooldowns['Air Scooter'] || (self.resources.chi || 0) < 2) return 0;
  
  let weight = 3;
  
  // High priority when health is low (evasion)
  if (self.currentHealth < 25) weight += 6;
  
  // High priority when recently damaged
  if (recentDamageTaken(log, self.name, 1) > 10) weight += 5;
  
  // Bonus for mobility advantage
  if (self.currentHealth > opp.currentHealth) weight += 2;
  
  // Bonus when chi is low (cheap move)
  if ((self.resources.chi || 0) < 4) weight += 3;
  
  // Penalty when winning comfortably
  if (self.currentHealth > opp.currentHealth + 20) weight -= 2;
  
  return Math.max(0, weight);
};

// Air Nomad Meditation - Healing and recovery
export const airNomadMeditationWeight: WeightFunction = (_state, self, opp, log) => {
  if (self.cooldowns['Air Nomad Meditation'] || (self.resources.chi || 0) < 3) return 0;
  
  let weight = 2;
  
  // High priority when critically wounded
  if (self.currentHealth < 20) weight += 9;
  
  // High priority when recently damaged heavily
  if (recentDamageTaken(log, self.name, 2) > 18) weight += 7;
  
  // Bonus when chi is available
  if ((self.resources.chi || 0) > 5) weight += 3;
  
  // Bonus when enemy is also low (safe to heal)
  if (opp.currentHealth < 30) weight += 2;
  
  // Penalty when enemy is aggressive
  if (recentDamageTaken(log, self.name, 1) > 12) weight -= 3;
  
  // Penalty when winning
  if (self.currentHealth > opp.currentHealth + 20) weight -= 4;
  
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
  if (self.currentHealth < 20) weight += 6;
  
  // High priority when losing badly
  if (opp.currentHealth > self.currentHealth + 25) weight += 4;
  
  // Bonus when enemy is also low (opportunity)
  if (opp.currentHealth < 30) weight += 2;
  
  return Math.max(0, weight);
};

/**
 * @description Get all weighted moves for Aang
 * @param {BattleCharacter} self - Aang's character data
 * @returns {Array<{id: string, move: Move, weightFn: WeightFunction, description: string}>} Weighted moves
 */
export function getAangWeightedMoves(self: BattleCharacter) {
  return [
    {
      id: 'airShield',
      move: self.abilities.find(a => a.name === 'Air Shield')!,
      weightFn: airShieldWeight,
      description: 'Primary defense, health protection'
    },
    {
      id: 'airBlast',
      move: self.abilities.find(a => a.name === 'Air Blast')!,
      weightFn: airBlastWeight,
      description: 'Reliable damage, counter after defense'
    },
    {
      id: 'windSlice',
      move: self.abilities.find(a => a.name === 'Wind Slice')!,
      weightFn: windSliceWeight,
      description: 'Piercing damage, counter shields'
    },
    {
      id: 'airScooter',
      move: self.abilities.find(a => a.name === 'Air Scooter')!,
      weightFn: airScooterWeight,
      description: 'Evasive, mobile, cheap'
    },
    {
      id: 'airNomadMeditation',
      move: self.abilities.find(a => a.name === 'Air Nomad Meditation')!,
      weightFn: airNomadMeditationWeight,
      description: 'Healing and recovery'
    }
  ].filter(item => item.move); // Filter out undefined moves
} 