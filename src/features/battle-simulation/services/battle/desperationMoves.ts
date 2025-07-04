// CONTEXT: Desperation Moves & Finisher System
// RESPONSIBILITY: Provide dramatic, high-risk moves that unlock at critical health levels
import { Ability } from '@/common/types';
import { BattleCharacter } from '../../types';

/**
 * @description Represents a desperation move that unlocks under specific conditions.
 */
export interface DesperationMove extends Omit<Ability, 'unlockCondition'> {
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
}

/**
 * @description Desperation move definitions for each character.
 */
export const DESPERATION_MOVES: Record<string, DesperationMove[]> = {
  'aang': [
    {
      name: 'Air Mastery',
      type: 'attack',
      power: 40,
      description: 'Aang channels his deepest airbending mastery, unleashing devastating power at great personal risk.',
      chiCost: 0, // No chi cost - powered by desperation
      unlockCondition: (character: BattleCharacter) => character.currentHealth <= 15,
      riskLevel: 'extreme',
      sideEffect: {
        type: 'self_damage',
        value: 10, // Takes 10 damage to self
        duration: 1
      },
      narrative: {
        unlock: 'Aang feels the ancient power of airbending stirring within him...',
        use: 'Aang\'s mastery of air reaches its peak!',
        success: 'Air Mastery unleashes devastating power, but the strain is immense!',
        failure: 'The power overwhelms Aang, causing severe backlash!'
      },
      isDesperation: true,
      dramaticNarrative: 'Air Mastery'
    },
    {
      name: 'Air Tornado',
      type: 'attack',
      power: 25,
      description: 'Creates a massive tornado that damages both combatants.',
      chiCost: 0,
      unlockCondition: (character: BattleCharacter) => character.currentHealth <= 25,
      riskLevel: 'high',
      sideEffect: {
        type: 'self_damage',
        value: 5, // Takes 5 damage to self
        duration: 1
      },
      narrative: {
        unlock: 'Aang channels his desperation into a massive air vortex...',
        use: 'Aang creates a devastating tornado that engulfs the battlefield!',
        success: 'The tornado wreaks havoc, but Aang is caught in its fury!',
        failure: 'The tornado spins out of control, backfiring on Aang!'
      },
      isDesperation: true,
      dramaticNarrative: 'Air Tornado'
    }
  ],
  'azula': [
    {
      name: 'Phoenix Rage',
      type: 'attack',
      power: 35,
      description: 'Azula channels her fury into an unstoppable firestorm.',
      chiCost: 0,
      unlockCondition: (character: BattleCharacter) => character.currentHealth <= 20,
      riskLevel: 'extreme',
      sideEffect: {
        type: 'chi_drain',
        value: 5, // Drains 5 chi
        duration: 2
      },
      narrative: {
        unlock: 'Azula\'s eyes burn with uncontainable fury...',
        use: 'Azula unleashes a devastating firestorm fueled by pure rage!',
        success: 'The firestorm consumes everything in its path!',
        failure: 'The firestorm consumes Azula\'s own energy!'
      },
      isDesperation: true,
      dramaticNarrative: 'Phoenix Rage'
    },
    {
      name: 'Lightning Storm',
      type: 'attack',
      power: 30,
      description: 'Creates a massive lightning storm that strikes randomly.',
      chiCost: 0,
      unlockCondition: (character: BattleCharacter) => character.currentHealth <= 30,
      riskLevel: 'high',
      sideEffect: {
        type: 'defense_reduction',
        value: 8, // Reduces defense by 8
        duration: 2
      },
      narrative: {
        unlock: 'Azula channels her desperation into pure lightning...',
        use: 'Azula creates a devastating lightning storm!',
        success: 'Lightning strikes with devastating force!',
        failure: 'The lightning backfires, leaving Azula vulnerable!'
      },
      isDesperation: true,
      dramaticNarrative: 'Lightning Storm'
    }
  ]
};

/**
 * @description Gets all available desperation moves for a character.
 * @param {BattleCharacter} character - The character to check
 * @returns {DesperationMove[]} Array of available desperation moves
 */
export function getAvailableDesperationMoves(character: BattleCharacter): DesperationMove[] {
  const characterMoves = DESPERATION_MOVES[character.name.toLowerCase()] || [];
  
  return characterMoves.filter(move => move.unlockCondition(character));
}

/**
 * @description Checks if a character has any desperation moves available.
 * @param {BattleCharacter} character - The character to check
 * @returns {boolean} True if desperation moves are available
 */
export function hasDesperationMoves(character: BattleCharacter): boolean {
  return getAvailableDesperationMoves(character).length > 0;
}

/**
 * @description Gets the most powerful available desperation move.
 * @param {BattleCharacter} character - The character to check
 * @returns {DesperationMove | null} The most powerful desperation move or null
 */
export function getBestDesperationMove(character: BattleCharacter): DesperationMove | null {
  const availableMoves = getAvailableDesperationMoves(character);
  
  if (availableMoves.length === 0) {
    return null;
  }
  
  // Return the move with highest power
  return availableMoves.reduce((best, current) => 
    current.power > best.power ? current : best
  );
}

/**
 * @description Applies the side effects of a desperation move.
 * @param {BattleCharacter} character - The character using the move
 * @param {DesperationMove} move - The desperation move used
 * @returns {BattleCharacter} Character with side effects applied
 */
export function applyDesperationSideEffects(
  character: BattleCharacter,
  move: DesperationMove
): BattleCharacter {
  if (!move.sideEffect) {
    return character;
  }

  const { type, value, duration = 1 } = move.sideEffect;
  
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
          chi: Math.max(0, character.resources.chi - value)
        }
      };
      
    case 'defense_reduction':
      return {
        ...character,
        currentDefense: Math.max(0, character.currentDefense - value)
      };
      
    case 'stun':
      // Add stun effect to flags
      return {
        ...character,
        flags: {
          ...character.flags,
          stunned: true,
          stunDuration: duration
        }
      };
      
    default:
      return character;
  }
}

/**
 * @description Gets narrative text for desperation move events.
 * @param {DesperationMove} move - The desperation move
 * @param {string} event - The event type ('unlock', 'use', 'success', 'failure')
 * @returns {string} Narrative text
 */
export function getDesperationNarrative(move: DesperationMove, event: keyof DesperationMove['narrative']): string {
  return move.narrative[event] || '';
}

/**
 * @description Checks if a character is in a desperate state (low health).
 * @param {BattleCharacter} character - The character to check
 * @returns {boolean} True if character is desperate
 */
export function isDesperate(character: BattleCharacter): boolean {
  return character.currentHealth <= 25;
}

/**
 * @description Checks if a character is critically wounded.
 * @param {BattleCharacter} character - The character to check
 * @returns {boolean} True if character is critically wounded
 */
export function isCriticallyWounded(character: BattleCharacter): boolean {
  return character.currentHealth <= 10;
} 