// CONTEXT: Finisher System Service
// RESPONSIBILITY: Handle finisher moves - dramatic, once-per-battle abilities

import { BattleCharacter, BattleState, BattleLogEntry } from '../../types';
import { Ability } from '@/common/types';
import { createEventId } from '../ai/logQueries';

/**
 * @description Finisher move configuration
 */
export interface FinisherMove extends Ability {
  isFinisher: true;
  finisherCondition: {
    type: 'hp_below' | 'phase';
    value: number | string;
  };
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
  const finisherMoves = character.abilities.filter(ability => 
    ability.tags?.includes('finisher')
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
    const threshold = finisher.finisherCondition.value as number;
    return (opponent.currentHealth / 100) <= (threshold / 100);
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
  const baseDamage = finisher.power;
  const defenseReduction = target.currentDefense;
  
  // Finishers have higher crit chance (30%)
  const isCritical = Math.random() < 0.30;
  const criticalMultiplier = isCritical ? (finisher.critMultiplier || 3.0) : 1;
  
  // Calculate final damage
  const rawDamage = Math.max(1, Math.floor((baseDamage - defenseReduction) * criticalMultiplier));
  const finalDamage = rawDamage;
  
  // Apply damage
  state.participants[targetIndex].currentHealth = Math.max(0, target.currentHealth - finalDamage);
  
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
  const logEntry: BattleLogEntry = {
    id: createEventId(),
    turn: state.turn,
    actor: attacker.name,
    type: 'FINISHER',
    action: finisher.name,
    target: target.name,
    abilityType: finisher.type,
    result,
    damage: finalDamage,
    narrative: finisher.narrative.success,
    timestamp: Date.now(),
    meta: {
      resourceCost: finisher.chiCost || 0,
      crit: isCritical,
      finisher: true,
      critMultiplier: criticalMultiplier
    }
  };
  
  return logEntry;
}

/**
 * @description Character-specific finisher moves
 */
export const CHARACTER_FINISHERS: Record<string, FinisherMove> = {
  'aang': {
    name: 'Gale Ender',
    type: 'attack',
    power: 45,
    description: 'Aang closes his eyes, one breath, one step, the cyclone erupts',
    chiCost: 10,
    cooldown: 0,
    maxUses: 1,
    tags: ['finisher', 'desperation', 'high-damage'],
    isFinisher: true,
    finisherCondition: {
      type: 'hp_below',
      value: 20 // Available when opponent below 20% HP
    },
    critMultiplier: 3.5,
    missPenalty: 'stun',
    narrative: {
      charge: 'Aang closes his eyes, one breath, one step. The air around him begins to swirl with ancient power.',
      success: 'The cyclone erupts. The throne room\'s pillars splinter. Azula is sent sprawling, lightning caged by wind. This is the end, or nothing.',
      miss: 'The wind spirals wild, missing its mark. Aang drops to his knees, exhausted. The opportunity slips away.'
    }
  },
  'azula': {
    name: 'Phoenix Inferno',
    type: 'attack',
    power: 50,
    description: 'Azula channels all remaining energy into a devastating final attack',
    chiCost: 12,
    cooldown: 0,
    maxUses: 1,
    tags: ['finisher', 'desperation', 'high-damage', 'piercing'],
    isFinisher: true,
    finisherCondition: {
      type: 'hp_below',
      value: 20 // Available when opponent below 20% HP
    },
    critMultiplier: 3.0,
    missPenalty: 'damage',
    narrative: {
      charge: 'Azula\'s eyes burn with blue fire. The air itself seems to ignite with her fury.',
      success: 'The Phoenix Inferno consumes everything. Fire splits stone and pride alike. The throne room becomes a furnace of destruction.',
      miss: 'The inferno rages out of control, backfiring on Azula. The flames consume her own energy.'
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