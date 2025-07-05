// CONTEXT: Generic Move Service
// RESPONSIBILITY: Execute generic moves with enhanced narrative generation

import { BattleState, BattleCharacter, BattleLogEntry } from '../../types';
import { Ability } from '@/common/types';
import { createEventId } from '../ai/logQueries';
import { createNarrativeService } from '../narrative';

/**
 * @description Result of executing a generic move
 */
export interface GenericMoveResult {
  newState: BattleState;
  logEntry: BattleLogEntry;
  damage: number;
  result: string;
  narrative: string;
  isCritical: boolean;
}

/**
 * @description Executes a generic move (fallback for unknown types) with enhanced narrative generation
 * @param {Ability} ability - The ability to execute
 * @param {BattleCharacter} attacker - The character using the ability
 * @param {BattleState} state - Current battle state
 * @returns {Promise<GenericMoveResult>} The execution result
 */
export async function executeGenericMove(
  ability: Ability,
  attacker: BattleCharacter,
  state: BattleState
): Promise<GenericMoveResult> {
  const result = `${ability.name} is used.`;
  
  // Initialize narrative service for enhanced storytelling
  const narrativeService = createNarrativeService();
  
  // Generate enhanced narrative for generic move
  const target = state.participants[1 - state.activeParticipantIndex]; // Target is the other participant
  const context = {
    damage: 0,
    maxHealth: target.stats.power + target.stats.defense + target.stats.agility,
    isMiss: false,
    isCritical: false,
    isPatternBreak: false,
    isEscalation: false,
    consecutiveHits: 0,
    consecutiveMisses: 0,
    turnNumber: state.turn,
    characterState: 'fresh' as const,
    chi: attacker.resources.chi || 0
  };
  
  let narrative = `${attacker.name} executes ${ability.name} with practiced precision.`;
  const genericNarrative = await narrativeService.generateNarrative(
    attacker.name,
    context,
    'hit',
    ability.name
  );
  if (genericNarrative) {
    narrative = genericNarrative;
  }
  
  const logEntry: BattleLogEntry = {
    id: createEventId(),
    turn: state.turn,
    actor: attacker.name,
    type: 'MOVE',
    action: ability.name,
    target: 'Unknown',
    abilityType: ability.type,
    result,
    narrative,
    timestamp: Date.now(),
    meta: {
      resourceCost: ability.chiCost || 0
    }
  };
  
  return {
    newState: state,
    logEntry,
    damage: 0,
    result,
    narrative,
    isCritical: false
  };
} 