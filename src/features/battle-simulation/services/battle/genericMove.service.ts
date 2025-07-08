// Used via dynamic registry in BattleEngine. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: Generic Move Service
// RESPONSIBILITY: Execute generic moves with enhanced narrative generation

import { BattleState, BattleCharacter, BattleLogEntry } from '../../types';
import type { Move } from '../../types/move.types';
import { createNarrativeService } from '../narrative';
import { logStory } from '../utils/mechanicLogUtils';

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
 * @param {Move} move - The move to execute
 * @param {BattleCharacter} attacker - The character using the move
 * @param {BattleState} state - Current battle state
 * @returns {Promise<GenericMoveResult>} The execution result
 */
export async function executeGenericMove(
  move: Move,
  attacker: BattleCharacter,
  state: BattleState
): Promise<GenericMoveResult> {
  const result = `${move.name} is used.`;
  
  // Initialize narrative service for enhanced storytelling
  const narrativeService = createNarrativeService();
  
  // Generate enhanced narrative for generic move
  const target = state.participants[1 - state.activeParticipantIndex]; // Target is the other participant
  const context = {
    damage: 0,
    maxHealth: target.base.stats.power + target.base.stats.defense + target.base.stats.agility,
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
  
  const genericMoveLines = [
    `${attacker.name} channels every ounce of training—${move.name} flows like a force of nature.`,
    `${attacker.name} unleashes ${move.name}, movement cutting through tension like a blade through silk.`,
    `With a flash of insight, ${attacker.name} crafts ${move.name} into an opening no opponent could expect.`,
    `The arena holds its breath as ${attacker.name} strikes—a perfect execution of ${move.name}.`,
    `${attacker.name}'s form blurs; ${move.name} becomes both shield and spear in the chaos.`,
    `A sudden surge—${move.name} erupts from ${attacker.name}, bending skill and instinct into one.`,
    `No hesitation—${attacker.name} makes ${move.name} an extension of their will, fate trembling on the edge.`,
    `${attacker.name} pivots, unleashing ${move.name} with a blend of mastery and improvisation.`,
    `Every lesson, every mistake, culminates in this: ${attacker.name}'s ${move.name} is both art and assault.`,
    `${attacker.name} embodies the spirit of a true bender, wielding ${move.name} as both challenge and invitation.`
  ];
  let narrative = genericMoveLines[Math.floor(Math.random() * genericMoveLines.length)];
  const genericNarrative = await narrativeService.generateNarrative(
    attacker.name,
    context,
    'hit',
    move.name
  );
  if (genericNarrative) {
    narrative = genericNarrative;
  }
  
  const logEntry = logStory({
    turn: state.turn,
    actor: attacker.name,
    narrative: narrative,
    target: target.name
  });
  if (logEntry) {
    return {
      newState: state,
      logEntry,
      damage: 0,
      result,
      narrative,
      isCritical: false
    };
  }
  // Fallback if logEntry is null
  return {
    newState: state,
    logEntry: {
      id: 'generic-move-fallback',
      turn: state.turn,
      actor: attacker.name,
      type: 'INFO',
      action: 'Generic Move',
      result: narrative,
      target: target.name,
      narrative: narrative,
      timestamp: Date.now(),
      details: undefined
    },
    damage: 0,
    result,
    narrative,
    isCritical: false
  };
} 