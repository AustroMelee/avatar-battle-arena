// CONTEXT: CharacterSelection, // FOCUS: StaticData
import { Character } from '@/common/types';
import { AANG_MOVES, AZULA_MOVES } from '../../battle-simulation/types/move.types';

/**
 * @description A static list of available characters for the simulation.
 * Contains detailed stats and abilities for each character.
 * @type {Character[]}
 */
export const availableCharacters: Character[] = [
  {
    id: 'aang',
    name: 'Aang',
    image: '/assets/aang.jpg',
    icon: '/assets/aang.jpg', // Use image asset for icon
    bending: 'air',
    stats: {
      power: 85,
      agility: 95,
      defense: 70,
      intelligence: 90
    },
    abilities: AANG_MOVES,
    personality: 'balanced',
    // NEW: Behavioral System Integration
    manipulationResilience: 30, // Aang is somewhat vulnerable to manipulation
    behavioralTraits: [
      { traitId: 'plea_for_peace', lastTriggeredTurn: -99 }
    ]
  },
  {
    id: 'azula',
    name: 'Azula',
    image: '/assets/azula.jpg',
    icon: '/assets/azula.jpg', // Use image asset for icon
    bending: 'fire',
    stats: {
      power: 90,
      agility: 85,
      defense: 75,
      intelligence: 95
    },
    abilities: AZULA_MOVES,
    personality: 'aggressive',
    // NEW: Behavioral System Integration
    manipulationResilience: 95, // Azula is highly resistant to manipulation
    behavioralTraits: [
      { traitId: 'manipulation', lastTriggeredTurn: -99 },
      { traitId: 'overconfidence', lastTriggeredTurn: -99 }
    ]
  },
]; 