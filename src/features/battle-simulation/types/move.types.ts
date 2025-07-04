// UPGRADED MOVE TYPES FOR DRAMATIC BATTLE SYSTEM

// Minimal BattleContext for move/finisher/desperation logic
export interface BattleContext {
  phase: 'normal' | 'climax' | 'stalemate';
  turn: number;
  selfHP: number;
  selfMaxHP: number;
  enemyHP: number;
  enemyMaxHP: number;
  hasUsedFinisher: boolean;
}

export type FinisherCondition =
  | { type: 'hp_below'; percent: number }
  | { type: 'phase'; phase: 'climax' | 'stalemate' }
  | { type: 'custom'; isAvailable: (ctx: BattleContext) => boolean };

export interface DesperationBuff {
  hpThreshold: number; // percent, e.g. 25
  damageBonus: number;
  defensePenalty: number;
}

export interface Move {
  id: string;
  name: string;
  chiCost: number;
  baseDamage: number;
  cooldown: number;
  critChance?: number;         // e.g. 0.1 = 10% chance
  critMultiplier?: number;     // e.g. 3 = triple damage
  isFinisher?: boolean;
  oncePerBattle?: boolean;
  finisherCondition?: FinisherCondition;
  desperationBuff?: DesperationBuff;
  description?: string;
}

// --- SAMPLE: AANG'S AIRBENDING MOVE SHEET ---

export const AANG_MOVES: Move[] = [
  {
    id: 'basic_strike',
    name: 'Basic Strike',
    chiCost: 0,
    baseDamage: 1,
    cooldown: 0,
    critChance: 0.12,
    critMultiplier: 3,
    description: 'Aang delivers a quick, focused physical blow.'
  },
  {
    id: 'air_tornado',
    name: 'Air Tornado',
    chiCost: 7,
    baseDamage: 3,
    cooldown: 3,
    critChance: 0.18,
    critMultiplier: 2.5,
    desperationBuff: { hpThreshold: 25, damageBonus: 2, defensePenalty: 5 },
    description: 'Aang summons a swirling tornado of air to batter his foe.'
  },
  {
    id: 'wind_slice',
    name: 'Wind Slice',
    chiCost: 5,
    baseDamage: 4,
    cooldown: 2,
    critChance: 0.15,
    critMultiplier: 2,
    description: 'A razor-sharp blade of wind that cuts through defenses.'
  },
  {
    id: 'air_shield',
    name: 'Air Shield',
    chiCost: 4,
    baseDamage: 0,
    cooldown: 4,
    description: 'A swirling barrier of air that boosts defense for 2 turns.'
  },
  {
    id: 'last_breath_cyclone',
    name: 'Last Breath Cyclone',
    chiCost: 10,
    baseDamage: 12,
    cooldown: 10,
    isFinisher: true,
    oncePerBattle: true,
    finisherCondition: { type: 'hp_below', percent: 20 },
    description: 'Aang channels every last ounce of strength into a world-shaking cyclone. Only available below 20% HP.'
  }
];

// --- SAMPLE: SUGGESTED CHARACTER STATS ---

export const AANG_STATS = {
  maxHP: 30,
  maxChi: 20,
  baseDefense: 5
};

export const AZULA_STATS = {
  maxHP: 32,
  maxChi: 22,
  baseDefense: 6
}; 