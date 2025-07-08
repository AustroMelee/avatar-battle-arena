// CONTEXT: Desperation Moves & Finisher System
// RESPONSIBILITY: Provide dramatic, high-risk moves that unlock at critical health levels

import type { Move } from '../../types/move.types';
import { BattleCharacter } from '../../types';

const MAX_HEALTH = 100; // Convention: global virtual max health for all mechanics

export interface DesperationMove extends Omit<Move, 'unlockCondition'> {
  unlockCondition: (character: BattleCharacter) => boolean;
  isDesperation: true;
  dramaticNarrative: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  sideEffect?: {
    type: 'self_damage' | 'chi_drain' | 'defense_reduction' | 'stun';
    value: number;
    duration?: number;
  };
  narrative: {
    unlock: string;
    use: string;
    success: string;
    failure?: string;
  };
  tags?: string[]; // Ensure tag compliance
}

export const DESPERATION_MOVES: Record<string, DesperationMove[]> = {
  'aang': [
    {
      id: 'air-mastery',
      name: 'Air Mastery',
      type: 'attack',
      baseDamage: 40,
      cooldown: 3,
      description: 'Aang channels his deepest airbending mastery, unleashing devastating power at great personal risk.',
      chiCost: 0,
      unlockCondition: (character: BattleCharacter) => (character.currentHealth / MAX_HEALTH) < 0.2,
      riskLevel: 'extreme',
      sideEffect: { type: 'self_damage', value: 10 },
      narrative: {
        unlock: 'Aang feels the ancient power of airbending stirring within him...',
        use: 'Aang unleashes the full force of the wind, risking everything!',
        success: 'Air Mastery devastates the opponent, but the strain is immense!',
        failure: 'The power overwhelms Aang, causing severe backlash!'
      },
      isDesperation: true,
      dramaticNarrative: "Aang's spirit surges as he risks it all for one final strike!",
      tags: ['desperation']
    },
    {
      id: 'air-tornado',
      name: 'Air Tornado',
      type: 'attack',
      baseDamage: 25,
      cooldown: 2,
      description: 'Creates a massive tornado that damages both combatants.',
      chiCost: 0,
      unlockCondition: (character: BattleCharacter) => (character.currentHealth / MAX_HEALTH) < 0.3,
      riskLevel: 'high',
      sideEffect: { type: 'self_damage', value: 5 },
      narrative: {
        unlock: 'Aang channels his desperation into a massive air vortex...',
        use: 'Aang creates a devastating tornado that engulfs the battlefield!',
        success: 'The tornado wreaks havoc, but Aang is caught in its fury!',
        failure: 'The tornado spins out of control, backfiring on Aang!'
      },
      isDesperation: true,
      dramaticNarrative: "Aang's desperation fuels a storm that spares no one!",
      tags: ['desperation']
    }
  ],
  'azula': [
    {
      id: 'phoenix-rage',
      name: 'Phoenix Rage',
      type: 'attack',
      baseDamage: 35,
      cooldown: 3,
      description: 'Azula channels her fury into an unstoppable firestorm.',
      chiCost: 0,
      unlockCondition: (character: BattleCharacter) => (character.currentHealth / MAX_HEALTH) < 0.25,
      riskLevel: 'extreme',
      sideEffect: { type: 'self_damage', value: 15 },
      narrative: {
        unlock: "Azula's eyes burn with uncontainable fury...",
        use: 'Azula unleashes a devastating firestorm fueled by pure rage!',
        success: 'The firestorm consumes everything in its path!',
        failure: "The firestorm consumes Azula's own energy!"
      },
      isDesperation: true,
      dramaticNarrative: "Azula's fury becomes a force of nature!",
      tags: ['desperation']
    },
    {
      id: 'lightning-storm',
      name: 'Lightning Storm',
      type: 'attack',
      baseDamage: 30,
      cooldown: 2,
      description: 'Creates a massive lightning storm that strikes randomly.',
      chiCost: 0,
      unlockCondition: (character: BattleCharacter) => (character.currentHealth / MAX_HEALTH) < 0.35,
      riskLevel: 'high',
      sideEffect: { type: 'self_damage', value: 10 },
      narrative: {
        unlock: 'Azula channels her desperation into pure lightning...',
        use: 'Azula creates a devastating lightning storm!',
        success: 'Lightning strikes with devastating force!',
        failure: 'The lightning backfires, leaving Azula vulnerable!'
      },
      isDesperation: true,
      dramaticNarrative: "Azula's desperation unleashes a storm of lightning!",
      tags: ['desperation']
    }
  ]
};

/**
 * Returns all available desperation moves for a character.
 */
export function getAvailableDesperationMoves(
  character: BattleCharacter
): DesperationMove[] {
  const characterMoves = DESPERATION_MOVES[character.name.toLowerCase()] || [];
  return characterMoves.filter(move => {
    const unlocked = move.unlockCondition(character);
    // (Optional) Place to add log entry when move is unlocked
    return unlocked;
  });
}

/**
 * Checks if a character has any desperation moves available.
 */
export function hasDesperationMoves(character: BattleCharacter): boolean {
  return getAvailableDesperationMoves(character).length > 0;
}

/**
 * Returns the most powerful available desperation move.
 */
export function getBestDesperationMove(character: BattleCharacter): DesperationMove | null {
  const availableMoves = getAvailableDesperationMoves(character);
  if (!availableMoves.length) return null;
  return availableMoves.reduce((best, current) =>
    current.baseDamage > best.baseDamage ? current : best
  );
}

/**
 * Applies the side effects of a desperation move, in a type-safe way.
 */
export function applyDesperationSideEffects(
  character: BattleCharacter,
  move: DesperationMove
): BattleCharacter {
  if (!move.sideEffect) return character;

  const { type, value } = move.sideEffect;

  switch (type) {
    case 'self_damage':
      return {
        ...character,
        currentHealth: Math.max(1, character.currentHealth - value)
      };
    case 'chi_drain':
      return {
        ...character,
        resources: {
          ...character.resources,
          chi: Math.max(0, (character.resources?.chi || 0) - value)
        }
      };
    case 'defense_reduction':
      return {
        ...character,
        currentDefense: Math.max(0, (character.currentDefense || 0) - value)
      };
    case 'stun':
      return {
        ...character,
        flags: {
          ...character.flags,
          stunDuration: value // or duration, as needed
        }
      };
      
    default:
      return character;
  }
}

/**
 * Gets narrative text for desperation move events.
 */
export function getDesperationNarrative(
  move: DesperationMove,
  event: keyof DesperationMove['narrative']
): string {
  return move.narrative[event] || '';
}

/**
 * True if the character is in a desperate state, using MAX_HEALTH.
 */
export function isDesperate(character: BattleCharacter): boolean {
  return (character.currentHealth / MAX_HEALTH) < 0.25;
}

/**
 * True if the character is critically wounded, using MAX_HEALTH.
 */
export function isCriticallyWounded(character: BattleCharacter): boolean {
  return (character.currentHealth / MAX_HEALTH) < 0.10;
} 