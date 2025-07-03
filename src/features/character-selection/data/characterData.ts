// CONTEXT: CharacterSelection, // FOCUS: StaticData
import { Character } from '@/common/types';

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
    bending: 'air',
    stats: {
      power: 70,
      agility: 98,
      defense: 15,
      intelligence: 80,
    },
    abilities: [
      { 
        name: 'Wind Gust', 
        type: 'attack', 
        power: 8, 
        description: 'A light, fast attack.',
        cooldown: 0, // No cooldown - can use every turn
        chiCost: 1, // Low cost for basic attack
        tags: ['quick']
      },
      { 
        name: 'Air Shield', 
        type: 'defense_buff', 
        power: 15, 
        description: 'Increases defense for one turn.',
        cooldown: 2, // 2-turn cooldown
        chiCost: 3, // Moderate cost for defensive ability
        tags: ['defensive']
      },
      { 
        name: 'Air Blast', 
        type: 'attack', 
        power: 18, 
        description: 'A powerful blast of focused air.',
        cooldown: 3, // 3-turn cooldown
        chiCost: 4, // Higher cost for powerful attack
        tags: ['piercing']
      },
      { 
        name: 'Wind Slice', 
        type: 'attack', 
        power: 25, 
        description: 'A devastating cutting wind that ignores defense.',
        cooldown: 4, // 4-turn cooldown
        chiCost: 6, // High cost for devastating attack
        tags: ['piercing', 'high-damage']
      },
      { 
        name: 'Last Stand', 
        type: 'defense_buff', 
        power: 30, 
        description: 'Desperate defense that doubles when health is low.',
        cooldown: 5, // 5-turn cooldown
        chiCost: 5, // High cost for emergency defense
        tags: ['defensive', 'desperate']
      },
    ],
    personality: 'defensive',
  },
  {
    id: 'azula',
    name: 'Azula',
    image: '/assets/azula.jpg',
    bending: 'fire',
    stats: {
      power: 95,
      agility: 95,
      defense: 12,
      intelligence: 100,
    },
    abilities: [
      { 
        name: 'Blue Fire', 
        type: 'attack', 
        power: 12, 
        description: 'A precise and powerful fire jab.',
        cooldown: 0, // No cooldown - can use every turn
        chiCost: 2, // Moderate cost for basic attack
        tags: ['precise']
      },
      { 
        name: 'Lightning', 
        type: 'attack', 
        power: 28, 
        description: 'A devastating, high-risk attack.',
        cooldown: 4, // 4-turn cooldown
        chiCost: 6, // High cost for devastating attack
        tags: ['piercing', 'high-damage']
      },
      { 
        name: 'Fire Jets', 
        type: 'defense_buff', 
        power: 12, 
        description: 'Uses fire jets to increase agility and defense.',
        cooldown: 2, // 2-turn cooldown
        chiCost: 3, // Moderate cost for defensive ability
        tags: ['defensive']
      },
      { 
        name: 'Firebomb', 
        type: 'attack', 
        power: 22, 
        description: 'An explosive attack that ignores defense.',
        cooldown: 3, // 3-turn cooldown
        chiCost: 5, // High cost for powerful attack
        tags: ['piercing', 'explosive']
      },
      { 
        name: 'Phoenix Recovery', 
        type: 'defense_buff', 
        power: 25, 
        description: 'Desperate recovery that heals when health is low.',
        cooldown: 5, // 5-turn cooldown
        chiCost: 7, // Very high cost for emergency recovery
        tags: ['defensive', 'healing', 'desperate']
      },
    ],
    personality: 'aggressive',
  },
  // FIXME: Add more characters like Zuko, Katara, Toph, etc. here
  // TEMP: Sokka (non-bender) could be added with 'none' as bending type later
]; 