// CONTEXT: Battle Resolution, // FOCUS: Triggers
import type { BattleState, BattleCharacter, BattleLogEntry, LogEventType, BattleResolution } from '../../types';
import type { Ability } from '@/common/types';
import { createEventId } from '../ai/logQueries';

/**
 * @description Desperation move definitions for each character
 */
export const DESPERATION_MOVES: Record<string, Ability> = {
  'azula': {
    name: 'Phoenix Inferno',
    type: 'attack',
    power: 25,
    chiCost: 8,
    cooldown: 0,
    maxUses: 1,
    description: 'Azula channels all remaining energy into a devastating final attack',
    tags: ['desperation', 'high-damage', 'piercing']
  },
  'aang': {
    name: 'Air Mastery Surge',
    type: 'attack',
    power: 20,
    chiCost: 6,
    cooldown: 0,
    maxUses: 1,
    description: 'Aang channels his deepest airbending mastery for a powerful counterattack',
    tags: ['desperation', 'high-damage', 'healing']
  }
};

/**
 * @description Character-specific victory and defeat lines
 */
export const CHARACTER_LINES: Record<string, {
  victory: string[];
  defeat: string[];
  desperation: string[];
  draw: string[];
}> = {
  'azula': {
    victory: [
      "That was too easy. You're not even worth my time.",
      "As expected. The Avatar is no match for true firebending.",
      "Your defeat was inevitable. Bow before the Fire Nation's might."
    ],
    defeat: [
      "Impossible... How could I lose?",
      "This isn't over, Avatar. You'll pay for this humiliation.",
      "You got lucky this time. Next time will be different."
    ],
    desperation: [
      "You've forced my hand. Feel the true power of fire!",
      "I won't be defeated so easily. BURN!",
      "This ends now. Phoenix Inferno!"
    ],
    draw: [
      "A stalemate? How... disappointing.",
      "Neither of us can claim victory. This changes nothing.",
      "We're evenly matched. For now."
    ]
  },
  'aang': {
    victory: [
      "I've trained hard for this moment. Thank you for the challenge!",
      "Airbending guided me to victory. I'll keep improving!",
      "Peace through strength. I hope you understand now."
    ],
    defeat: [
      "I still have much to learn. Thank you for the lesson.",
      "Defeat is just another step on the path to mastery.",
      "I'll train harder and come back stronger."
    ],
    desperation: [
      "I won't give up! Airbending, guide me!",
      "For my friends, for peace - I must prevail!",
      "My airbending awakens. This is my final stand!"
    ],
    draw: [
      "We're evenly matched. Perhaps we can find common ground?",
      "Neither of us won, but neither of us lost either.",
      "This battle has taught us both something valuable."
    ]
  }
};

/**
 * @description Check if a character should trigger desperation move
 * @param {BattleCharacter} character - The character to check
 * @returns {boolean} True if desperation should trigger
 */
export function shouldTriggerDesperation(character: BattleCharacter): boolean {
  const shouldTrigger = (
    character.currentHealth <= 10 && 
    !character.flags?.usedDesperation &&
    (character.resources.chi || 0) >= 6
  );
  
  console.log(`[DESPERATION DEBUG] ${character.name}: HP=${character.currentHealth}, Used=${character.flags?.usedDesperation}, Chi=${character.resources.chi}, ShouldTrigger=${shouldTrigger}`);
  
  return shouldTrigger;
}

/**
 * @description Check if both characters are in a stalemate
 * @param {BattleState} state - The current battle state
 * @returns {boolean} True if stalemate conditions are met
 */
export function isStalemate(state: BattleState): boolean {
  const [p1, p2] = state.participants;
  
  // Both at very low health
  const bothLowHealth = p1.currentHealth <= 1 && p2.currentHealth <= 1;
  
  // Both out of chi and all moves on cooldown
  const bothExhausted = 
    (p1.resources.chi || 0) === 0 && 
    (p2.resources.chi || 0) === 0 &&
    Object.keys(p1.cooldowns).length === p1.abilities.length &&
    Object.keys(p2.cooldowns).length === p2.abilities.length;
  
  // Both have used desperation moves
  const bothDesperate = (p1.flags?.usedDesperation || false) && (p2.flags?.usedDesperation || false);
  
  return bothLowHealth || bothExhausted || bothDesperate;
}

/**
 * @description Check if both characters are simultaneously KO'd
 * @param {BattleState} state - The current battle state
 * @returns {boolean} True if mutual KO
 */
export function isMutualKO(state: BattleState): boolean {
  const [p1, p2] = state.participants;
  return p1.currentHealth <= 0 && p2.currentHealth <= 0;
}

/**
 * @description Check if battle has exceeded turn limit
 * @param {BattleState} state - The current battle state
 * @param {number} maxTurns - Maximum turns before draw (default: 100)
 * @returns {boolean} True if turn limit exceeded
 */
export function isTurnLimitExceeded(state: BattleState, maxTurns: number = 100): boolean {
  return state.turn > maxTurns;
}

/**
 * @description Get a random line for a character and situation
 * @param {string} characterName - The character's name
 * @param {string} situation - The situation (victory, defeat, desperation, draw)
 * @returns {string} A random line for the situation
 */
export function getCharacterLine(characterName: string, situation: string): string {
  const lines = CHARACTER_LINES[characterName.toLowerCase()];
  if (!lines || !lines[situation as keyof typeof lines]) {
    return `${characterName} ${situation}.`;
  }
  
  const situationLines = lines[situation as keyof typeof lines];
  return situationLines[Math.floor(Math.random() * situationLines.length)];
}

/**
 * @description Create a battle resolution log entry
 * @param {BattleResolution} resolution - The type of resolution
 * @param {BattleState} state - The current battle state
 * @param {string} winner - The winner's name (if applicable)
 * @param {string} flavor - The flavor text
 * @returns {BattleLogEntry} The resolution log entry
 */
export function createResolutionLogEntry(
  resolution: BattleResolution,
  state: BattleState,
  winner?: string,
  flavor?: string
): BattleLogEntry {
  const eventType: LogEventType = resolution.toUpperCase() as LogEventType;
  
  return {
    id: createEventId(),
    turn: state.turn,
    actor: 'System',
    type: eventType,
    action: resolution,
    result: flavor || `${resolution} condition met`,
    narrative: flavor || `The battle ends in ${resolution}.`,
    timestamp: Date.now(),
    meta: {
      resolution,
      winner
    }
  };
}

/**
 * @description Check all resolution triggers and return the appropriate action
 * @param {BattleState} state - The current battle state
 * @param {BattleCharacter} activeCharacter - The character whose turn it is
 * @returns {{type: BattleResolution, move?: Ability, logEntry: BattleLogEntry} | null} Resolution action or null
 */
export function checkResolutionTriggers(
  state: BattleState, 
  activeCharacter: BattleCharacter
): {type: BattleResolution, move?: Ability, logEntry: BattleLogEntry} | null {
  const [p1, p2] = state.participants;
  const opponent = activeCharacter.name === p1.name ? p2 : p1;
  
  console.log(`[RESOLUTION CHECK] Turn ${state.turn}: ${activeCharacter.name} vs ${opponent.name}`);
  console.log(`[RESOLUTION CHECK] ${activeCharacter.name}: HP=${activeCharacter.currentHealth}, Chi=${activeCharacter.resources.chi}, UsedDesperation=${activeCharacter.flags?.usedDesperation}`);
  console.log(`[RESOLUTION CHECK] ${opponent.name}: HP=${opponent.currentHealth}, Chi=${opponent.resources.chi}, UsedDesperation=${opponent.flags?.usedDesperation}`);
  
  // 1. Check for mutual KO
  if (isMutualKO(state)) {
    const logEntry = createResolutionLogEntry(
      'mutual_ko',
      state,
      undefined,
      'Both combatants fall simultaneously in a devastating exchange!'
    );
    return { type: 'mutual_ko', logEntry };
  }
  
  // 2. Check for desperation trigger
  if (shouldTriggerDesperation(activeCharacter)) {
    const desperationMove = DESPERATION_MOVES[activeCharacter.name.toLowerCase()];
    if (desperationMove) {
      const line = getCharacterLine(activeCharacter.name, 'desperation');
      const logEntry = createResolutionLogEntry(
        'desperation',
        state,
        activeCharacter.name,
        `${activeCharacter.name} unleashes a desperate final attack! ${line}`
      );
      return { type: 'desperation', move: desperationMove, logEntry };
    }
  }
  
  // 3. Check for stalemate
  if (isStalemate(state)) {
    const line = getCharacterLine(activeCharacter.name, 'draw');
    const logEntry = createResolutionLogEntry(
      'draw',
      state,
      undefined,
      `Both warriors are exhausted and can fight no more. ${line}`
    );
    return { type: 'draw', logEntry };
  }
  
  // 4. Check for turn limit
  if (isTurnLimitExceeded(state)) {
    const logEntry = createResolutionLogEntry(
      'draw',
      state,
      undefined,
      'The battle has dragged on too long. Both combatants are declared exhausted.'
    );
    return { type: 'draw', logEntry };
  }
  
  // 5. Check for individual KO
  if (opponent.currentHealth <= 0) {
    const line = getCharacterLine(activeCharacter.name, 'victory');
    const logEntry = createResolutionLogEntry(
      'victory',
      state,
      activeCharacter.name,
      `${activeCharacter.name} stands victorious! ${line}`
    );
    return { type: 'victory', logEntry };
  }
  
  return null;
} 