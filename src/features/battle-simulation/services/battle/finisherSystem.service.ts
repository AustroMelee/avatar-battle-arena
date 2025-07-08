// CONTEXT: Finisher System Service
// RESPONSIBILITY: Handle finisher moves - dramatic, once-per-battle abilities

import { BattleCharacter, BattleState, BattleLogEntry } from '../../types';
import type { Move, FinisherCondition } from '../../types/move.types';
import { createEventId } from '../ai/logQueries';
import { trackDamage, trackChiSpent } from './analyticsTracker.service';
import { logStory, logTechnical } from '../utils/mechanicLogUtils';

/**
 * @description Finisher move configuration
 */
export interface FinisherMove extends Move {
  isFinisher: true;
  finisherCondition: FinisherCondition;
  critMultiplier: number;
  missPenalty: 'stun' | 'damage' | 'none';
  narrative: {
    charge: string;
    success: string;
    miss: string;
  };
}

/**
 * @description Checks if a finisher move is available
 * @param {BattleCharacter} character - The character
 * @param {BattleCharacter} opponent - The opponent
 * @param {BattleState} state - Current battle state
 * @returns {FinisherMove | null} Available finisher move or null
 */
export function getAvailableFinisher(
  character: BattleCharacter,
  opponent: BattleCharacter,
  state: BattleState
): FinisherMove | null {
  // Check if character has already used a finisher
  if (character.flags?.usedFinisher) {
    return null;
  }

  // Find finisher moves
  const finisherMoves = character.abilities.filter(move =>
    move.tags?.includes('finisher')
  ) as FinisherMove[];

  for (const finisher of finisherMoves) {
    if (isFinisherConditionMet(finisher, character, opponent, state)) {
      return finisher;
    }
  }

  return null;
}

/**
 * @description Checks if finisher condition is met
 * @param {FinisherMove} finisher - The finisher move
 * @param {BattleCharacter} character - The character
 * @param {BattleCharacter} opponent - The opponent
 * @param {BattleState} state - Current battle state
 * @returns {boolean} Whether condition is met
 */
function isFinisherConditionMet(
  finisher: FinisherMove,
  _character: BattleCharacter,
  opponent: BattleCharacter,
  state: BattleState
): boolean {
  if (!finisher.finisherCondition) {
    console.warn('Finisher move missing finisherCondition:', finisher);
    return false;
  }

  if (finisher.finisherCondition.type === 'hp_below') {
    const threshold = finisher.finisherCondition.percent;
    // Compute maxHealth as sum of base stats (power + defense + agility)
    const maxHealth = opponent.base.stats.power + opponent.base.stats.defense + opponent.base.stats.agility;
    return (opponent.currentHealth / maxHealth) * 100 <= threshold;
  }
  
  if (finisher.finisherCondition.type === 'phase') {
    // Check if we're in the climax phase (last few turns)
    return state.turn >= 20; // Simple climax phase check
  }
  
  return false;
}

/**
 * @description Executes a finisher move with dramatic narrative
 * @param {FinisherMove} finisher - The finisher move
 * @param {BattleCharacter} attacker - The attacking character
 * @param {BattleCharacter} target - The target character
 * @param {BattleState} state - Current battle state
 * @param {number} targetIndex - Index of target in participants array
 * @returns {BattleLogEntry} The finisher log entry
 */
export function executeFinisherMove(
  finisher: FinisherMove,
  attacker: BattleCharacter,
  target: BattleCharacter,
  state: BattleState,
  targetIndex: number
): BattleLogEntry {
  // Calculate base damage with finisher bonus
  const baseDamage = finisher.baseDamage;
  const defenseReduction = target.currentDefense;
  
  // Finishers have higher crit chance (30%)
  const isCritical = Math.random() < 0.30;
  const criticalMultiplier = isCritical ? (finisher.critMultiplier || 3.0) : 1;
  
  // Calculate final damage
  const rawDamage = Math.max(1, Math.floor((baseDamage - defenseReduction) * criticalMultiplier));
  const finalDamage = rawDamage;
  
  // Apply damage
  state.participants[targetIndex].currentHealth = Math.max(0, target.currentHealth - finalDamage);
  
  // Update analytics immediately for finisher damage and chi cost
  if (state.analytics) {
    state.analytics = trackDamage(state.analytics, finalDamage, isCritical);
    state.analytics = trackChiSpent(state.analytics, finisher.chiCost || 0);
  }
  
  // Mark finisher as used
  const attackerIndex = state.participants.findIndex(p => p.name === attacker.name);
  if (attackerIndex !== -1) {
    state.participants[attackerIndex].flags = {
      ...state.participants[attackerIndex].flags,
      usedFinisher: true
    };
  }
  
  // Generate result text
  let result: string;
  if (isCritical) {
    result = `FINISHER CRITICAL! ${target.name} is devastated, taking ${finalDamage} damage!`;
  } else {
    result = `FINISHER! ${target.name} takes ${finalDamage} damage!`;
  }
  
  // Create dramatic log entry
  const logEntry = logStory({
    turn: state.turn,
    actor: attacker.name,
    narrative: finisher.narrative.success,
    target: target.name
  });
  
  return logEntry;
}

/**
 * @description Character-specific finisher moves
 */
export const CHARACTER_FINISHERS: Record<string, FinisherMove> = {
  'aang': {
    id: 'finisher_aang',
    name: 'Gale Ender',
    type: 'attack',
    baseDamage: 45,
    description: 'Aang closes his eyes, one breath, one step, the cyclone erupts',
    chiCost: 10,
    cooldown: 0,
    maxUses: 1,
    tags: ['finisher', 'desperation', 'high-damage'],
    isFinisher: true,
    finisherCondition: { type: 'hp_below', percent: 20 },
    critMultiplier: 3.5,
    missPenalty: 'stun',
    narrative: {
      charge: 'Aang closes his eyes, one breath, one step. The air around him begins to swirl with ancient power.',
      success: 'The cyclone erupts. The throne room\'s pillars splinter. Azula is sent sprawling, lightning caged by wind. This is the end, or nothing.',
      miss: 'The wind spirals wild, missing its mark. Aang drops to his knees, exhausted. The opportunity slips away.'
    }
  },
  'azula': {
    id: 'finisher_azula',
    name: 'Phoenix Inferno',
    type: 'attack',
    baseDamage: 50,
    description: 'Azula channels all remaining energy into a devastating final attack',
    chiCost: 12,
    cooldown: 0,
    maxUses: 1,
    tags: ['finisher', 'desperation', 'high-damage', 'piercing'],
    isFinisher: true,
    finisherCondition: { type: 'hp_below', percent: 20 },
    critMultiplier: 3.0,
    missPenalty: 'damage',
    narrative: {
      charge: 'Azula gathers every spark of her will, blue fire swirling into a blinding inferno.',
      success: 'The Phoenix Inferno engulfs the battlefield. Aang is forced to his knees, the world awash in blue flame. Azula stands triumphant, if only for a moment.',
      miss: 'The inferno rages, but Aang slips through the flames. Azula gasps, her energy spent, the moment lost.'
    }
  }
};

/**
 * @description Gets finisher move for a character
 * @param {string} characterName - The character name
 * @returns {FinisherMove | null} The finisher move or null
 */
export function getCharacterFinisher(characterName: string): FinisherMove | null {
  return CHARACTER_FINISHERS[characterName.toLowerCase()] || null;
} 