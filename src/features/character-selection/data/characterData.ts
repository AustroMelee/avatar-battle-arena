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
      power: 85,
      agility: 95,
      defense: 70,
      intelligence: 90
    },
    abilities: [
      {
        name: 'Basic Strike',
        type: 'attack',
        power: 1,
        description: 'Aang delivers a quick, focused physical blow',
        chiCost: 0,
        cooldown: 0,
        maxUses: 5,
        tags: ['basic'],
        critChance: 0.12,
        critMultiplier: 3
      },
      {
        name: 'Air Blast',
        type: 'attack',
        power: 2,
        description: 'A powerful blast of compressed air',
        chiCost: 4,
        cooldown: 2,
        maxUses: 5,
        tags: ['piercing'],
        critChance: 0.15,
        critMultiplier: 2.5
      },
      {
        name: 'Wind Slice',
        type: 'attack',
        power: 4,
        description: 'A sharp blade of wind that cuts through defenses',
        chiCost: 6,
        cooldown: 3,
        maxUses: 4,
        tags: ['piercing', 'high-damage'],
        critChance: 0.18,
        critMultiplier: 2.5
      },
      {
        name: 'Air Shield',
        type: 'defense_buff',
        power: 15,
        description: 'Creates a protective barrier of swirling air',
        chiCost: 3,
        cooldown: 4,
        maxUses: 3,
        tags: ['defensive'],
        appliesEffect: {
          type: 'DEFENSE_UP',
          chance: 1.0, // Always applies defense buff
          duration: 3,
          potency: 15 // +15 defense
        }
      },
      {
        name: 'Flowing Evasion',
        type: 'evade',
        power: 75,
        description: 'Aang uses airbending to become like the wind, flowing around attacks with graceful evasion',
        chiCost: 4,
        cooldown: 3,
        maxUses: 4,
        tags: ['defensive', 'evasion'],
        critChance: 0.05,
        critMultiplier: 1.5
      },
      {
        name: 'Focus',
        type: 'defense_buff',
        power: 25,
        description: 'Focuses chi to heal and strengthen',
        chiCost: 5,
        cooldown: 5,
        maxUses: 2,
        tags: ['healing', 'defensive'],
        appliesEffect: {
          type: 'HEAL_OVER_TIME',
          chance: 1.0, // Always applies healing
          duration: 3,
          potency: 5 // 5 health per turn
        }
      },
      // Desperation moves that unlock at low health
      {
        name: 'Air Tornado',
        type: 'attack',
        power: 3,
        description: 'Aang summons a swirling tornado of air to batter his foe',
        chiCost: 7,
        cooldown: 3,
        tags: ['desperation', 'area'],
        critChance: 0.18,
        critMultiplier: 2.5,
        desperationBuff: { hpThreshold: 25, damageBonus: 2, defensePenalty: 5 },
        unlockCondition: {
          type: 'health',
          threshold: 25
        },
        collateralDamage: 2,
        collateralDamageNarrative: "The force of the cyclone rips cobblestones from the ground and sends debris flying through the plaza.",
      },
      {
        name: 'Last Breath Cyclone',
        type: 'attack',
        power: 12,
        description: 'Aang channels every last ounce of strength into a world-shaking cyclone',
        chiCost: 10,
        cooldown: 0,
        maxUses: 1,
        tags: ['finisher', 'desperation', 'high-damage'],
        isFinisher: true,
        oncePerBattle: true,
        finisherCondition: {
          type: 'hp_below',
          percent: 20
        },
        unlockCondition: {
          type: 'health',
          threshold: 20
        },
        collateralDamage: 3,
        collateralDamageNarrative: "The force of the cyclone rips cobblestones from the ground and shatters the facades of nearby buildings.",
      }
    ],
    personality: 'balanced'
  },
  {
    id: 'azula',
    name: 'Azula',
    image: '/assets/azula.jpg',
    bending: 'fire',
    stats: {
      power: 90,
      agility: 85,
      defense: 75,
      intelligence: 95
    },
    abilities: [
      {
        name: 'Basic Strike',
        type: 'attack',
        power: 1,
        description: 'Azula delivers a focused physical strike',
        chiCost: 0,
        cooldown: 0,
        tags: ['basic'],
        critChance: 0.10,
        critMultiplier: 3
      },
      {
        name: 'Blue Fire',
        type: 'attack',
        power: 3,
        description: 'Intense blue flames that burn hotter than normal fire',
        chiCost: 2,
        cooldown: 1,
        tags: ['piercing'],
        critChance: 0.16,
        critMultiplier: 2.8,
        appliesEffect: {
          type: 'BURN',
          chance: 1.0, // Always applies burn for testing
          duration: 3,
          potency: 2 // 2 damage per turn
        },
        collateralDamage: 1,
        collateralDamageNarrative: "The intense heat scorches nearby surfaces and leaves blackened marks on the stone.",
      },
      {
        name: 'Fire Jets',
        type: 'defense_buff',
        power: 12,
        description: 'Uses fire propulsion to enhance mobility and defense',
        chiCost: 3,
        cooldown: 1,
        tags: ['defensive']
      },
      {
        name: 'Blazing Counter',
        type: 'parry_retaliate',
        power: 20,
        description: 'Azula uses a precise blast of fire to intercept an attack and create an opening for a devastating counter',
        chiCost: 5,
        cooldown: 4,
        maxUses: 3,
        tags: ['defensive', 'counter'],
        critChance: 0.08,
        critMultiplier: 2.0
      },
      {
        name: 'Phoenix Recovery',
        type: 'defense_buff',
        power: 25,
        description: 'Channels fire energy to heal and strengthen',
        chiCost: 7,
        cooldown: 3,
        tags: ['healing', 'defensive'],
        appliesEffect: {
          type: 'HEAL_OVER_TIME',
          chance: 1.0, // Always applies healing
          duration: 4,
          potency: 6 // 6 health per turn
        }
      },
      {
        name: 'Focus',
        type: 'defense_buff',
        power: 5,
        description: 'Takes a moment to focus and recover chi',
        chiCost: 0,
        cooldown: 0,
        tags: ['rest', 'fallback', 'climax']
      },
      // Desperation moves that unlock at low health
      {
        name: 'Lightning Storm',
        type: 'attack',
        power: 5,
        description: 'Channels lightning for a powerful attack',
        chiCost: 7,
        cooldown: 6,
        maxUses: 2,
        tags: ['desperation', 'lightning'],
        critChance: 0.20,
        critMultiplier: 3.0,
        desperationBuff: { hpThreshold: 25, damageBonus: 3, defensePenalty: 8 },
        unlockCondition: {
          type: 'health',
          threshold: 25
        },
        collateralDamage: 2,
        collateralDamageNarrative: "The bolt of lightning misses its primary target, striking a nearby statue and sending superheated shrapnel flying.",
      },
      {
        name: 'Phoenix Inferno',
        type: 'attack',
        power: 15,
        description: 'Azula channels all remaining energy into a devastating final attack',
        chiCost: 12,
        cooldown: 0,
        maxUses: 1,
        tags: ['finisher', 'desperation', 'high-damage', 'piercing'],
        isFinisher: true,
        oncePerBattle: true,
        finisherCondition: {
          type: 'hp_below',
          percent: 20
        },
        unlockCondition: {
          type: 'health',
          threshold: 20
        },
        collateralDamage: 3,
        collateralDamageNarrative: "The inferno engulfs the entire plaza, leaving nothing but scorched earth and melted stone in its wake.",
      }
    ],
    personality: 'aggressive'
  },
  // FIXME: Add more characters like Zuko, Katara, Toph, etc. here
  // TEMP: Sokka (non-bender) could be added with 'none' as bending type later
]; 