// @docs
// @description: SINGLE SOURCE OF TRUTH for all character data in Avatar Battle Arena. Registry/data-driven, plug-and-play architecture. No hard-coded logic. Extensible via data only. SRP-compliant. See SYSTEM ARCHITECTURE.MD for integration points.
// @criticality: 🗂️ Data
// @owner: AustroMelee
// @tags: characters, data, registry, plug-and-play, extensibility, SRP
//
// All characters must be added here and reference move IDs from moves.ts. No engine changes required for new characters.
//
// Updated for 2025 registry-driven architecture overhaul.
import { Character } from '@/common/types';

/**
 * @description A static list of available characters for the simulation.
 * Each character now specifies its AI and Narrative IDs.
 */
export const availableCharacters: Character[] = [
  {
    id: 'aang',
    name: 'Aang',
    aiRulesetId: 'aang',
    narrativeId: 'aang',
    pronounId: 'male',
    image: '/assets/aang.jpg',
    icon: '/assets/aang.jpg',
    bending: 'air',
    stats: { power: 85, agility: 95, defense: 70, intelligence: 90 },
    abilities: [
      'aang_basic_strike', 'aang_air_glide', 'aang_air_tornado',
      'aang_wind_slice', 'aang_air_shield', 'aang_charged_tornado',
      'aang_last_breath_cyclone', 'aang_flowing_evasion',
    ],
    personality: 'balanced',
    manipulationResilience: 30,
    behavioralTraits: [{ traitId: 'plea_for_peace', lastTriggeredTurn: -99 }]
  },
  {
    id: 'azula',
    name: 'Azula',
    aiRulesetId: 'azula',
    narrativeId: 'azula',
    pronounId: 'female',
    image: '/assets/azula.jpg',
    icon: '/assets/azula.jpg',
    bending: 'fire',
    stats: { power: 90, agility: 85, defense: 75, intelligence: 95 },
    abilities: [
      'azula_basic_strike', 'azula_blue_fire', 'azula_fire_dash',
      'azula_lightning', 'azula_fire_shield', 'azula_relentless_assault',
      'azula_blazing_counter', 'azula_phoenix_inferno',
    ],
    personality: 'aggressive',
    manipulationResilience: 95,
    behavioralTraits: [
      { traitId: 'manipulation', lastTriggeredTurn: -99 },
      { traitId: 'overconfidence', lastTriggeredTurn: -99 }
    ]
  },
];

/**
 * Looks up a character by ID from the registry.
 * @param {string} id - The character ID
 * @returns {Character | undefined}
 */
export function getCharacterById(id: string) {
  return availableCharacters.find(c => c.id === id);
} 