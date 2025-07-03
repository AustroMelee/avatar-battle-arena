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
      defense: 85,
      intelligence: 80,
    },
    abilities: [
      { name: 'Wind Gust', type: 'attack', power: 25, description: 'A light, fast attack.' },
      { name: 'Air Shield', type: 'defense_buff', power: 20, description: 'Greatly increases defense for one turn.' },
      { name: 'Air Blast', type: 'attack', power: 45, description: 'A powerful blast of focused air.' },
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
      defense: 65,
      intelligence: 100,
    },
    abilities: [
      { name: 'Blue Fire', type: 'attack', power: 55, description: 'A precise and powerful fire jab.' },
      { name: 'Lightning', type: 'attack', power: 90, description: 'A devastating, high-risk attack.' },
      { name: 'Fire Jets', type: 'defense_buff', power: 15, description: 'Uses fire jets to increase agility and defense.' },
    ],
    personality: 'aggressive',
  },
  // FIXME: Add more characters like Zuko, Katara, Toph, etc. here
  // TEMP: Sokka (non-bender) could be added with 'none' as bending type later
]; 