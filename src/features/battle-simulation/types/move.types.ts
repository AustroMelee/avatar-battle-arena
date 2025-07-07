// UPGRADED MOVE TYPES FOR DRAMATIC BATTLE SYSTEM

// Position types for tactical positioning system
export type Position = 
  | "neutral" 
  | "defensive" 
  | "aggressive" 
  | "high_ground" 
  | "cornered" 
  | "flying" 
  | "stunned" 
  | "charging" 
  | "repositioning";

// Location types for environmental constraints
export type LocationType = 
  | "Open" 
  | "Enclosed" 
  | "Desert" 
  | "Air-Friendly" 
  | "Water-Friendly" 
  | "Fire-Friendly" 
  | "Earth-Friendly";

// Minimal BattleContext for move/finisher/desperation logic
export interface BattleContext {
  phase: 'normal' | 'climax' | 'stalemate';
  turn: number;
  selfHP: number;
  selfMaxHP: number;
  enemyHP: number;
  enemyMaxHP: number;
  hasUsedFinisher: boolean;
  // New positioning and environmental context
  location: string; // e.g., "Fire Nation Throne Room", "Desert"
  locationType: LocationType;
  selfPosition: Position;
  enemyPosition: Position;
  lastAction: string;
  isSelfStunned: boolean;
  isEnemyStunned: boolean;
  isSelfCharging: boolean;
  isEnemyCharging: boolean;
  selfChargeProgress?: number; // 0-100 for charge-up moves
  enemyChargeProgress?: number;
  repositionAttempts: number; // Track reposition attempts for diminishing returns
  chargeInterruptions: number; // Track failed charge attempts
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
  type: 'attack' | 'defense_buff' | 'evade' | 'parry_retaliate';
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
  maxUses?: number;            // Maximum uses per battle (e.g., 3 Lightning bolts)
  
  // NEW: Collateral damage system for narrative impact
  collateralDamage?: 0 | 1 | 2 | 3; // 0: None, 1: Minor, 2: Moderate, 3: Major
  collateralDamageNarrative?: string; // e.g., "shatters nearby windows", "sends stone flying"
  
  // NEW: Future-proofing for "mixup" attacks that counter specific defensive styles
  beatsDefenseType?: 'evade' | 'parry_retaliate';
  
  // NEW: Positioning and tactical mechanics
  requiresPosition?: Position[]; // e.g., ['aggressive', 'high_ground']
  changesPosition?: Position;    // e.g., 'repositioning', 'flying', etc.
  isChargeUp?: boolean;
  chargeTime?: number; // Turns required to charge (default 1)
  canBeInterrupted?: boolean;
  onlyIfEnemyState?: ("repositioning" | "stunned" | "charging")[];
  punishIfCharging?: boolean; // If true, enemies get a bonus if they attack you while you charge
  environmentalConstraints?: LocationType[]; // ["Open"], ["Enclosed"], etc.
  repositionSuccessRate?: number; // 0-1, chance of successful reposition
  chargeInterruptionPenalty?: number; // Damage taken if charge is interrupted
  positionBonus?: {
    [key in Position]?: {
      damageMultiplier?: number;
      defenseBonus?: number;
      chiCostReduction?: number;
    };
  };
  appliesEffect?: {
    type: 'DEFENSE_UP' | 'ATTACK_UP' | 'CRIT_CHANCE_UP' | 'HEAL_OVER_TIME' | 'BURN' | 'STUN' | 'DEFENSE_DOWN' | 'SLOW';
    chance: number; // Probability of applying the effect (0.0 to 1.0)
    duration: number; // How many turns the effect lasts
    potency: number; // Effect strength (damage per turn for BURN, % increase for buffs, etc.)
  };
  // --- EXTENDED FOR BATTLE ENGINE SINGLE SOURCE OF TRUTH ---
  tags?: string[];
  unlockCondition?: { type: 'health'; threshold: number };
}

// Disruption/impact class for narrative-first battle system
export type ImpactClass = 'minor' | 'moderate' | 'severe';

/**
 * UPGRADED: Ability for disruption system
 * NOTE: Does not extend Move directly due to incompatible 'type' property.
 * For migration, use Ability for new disruption logic and Move for legacy logic.
 */
export interface Ability {
  id: string;
  name: string;
  type: 'attack' | 'disruption' | 'positioning' | 'deception';
  impactClass: ImpactClass;
  disruptsOnHit?: boolean;
  description: string;
  // ...other fields as needed
}

// --- SAMPLE: AANG'S AIRBENDING MOVE SHEET ---

export const AANG_MOVES: Move[] = [
  {
    id: 'basic_strike',
    name: 'Basic Strike',
    type: 'attack',
    chiCost: 0,
    baseDamage: 1,
    cooldown: 0,
    critChance: 0.12,
    critMultiplier: 3,
    description: 'Aang delivers a quick, focused physical blow.',
    punishIfCharging: true,
    tags: [],
    unlockCondition: undefined,
  },
  {
    id: 'reposition',
    name: 'Air Glide',
    type: 'defense_buff',
    chiCost: 1,
    baseDamage: 0,
    cooldown: 1,
    changesPosition: "repositioning",
    repositionSuccessRate: 0.9, // High success rate for airbender
    environmentalConstraints: ["Open", "Air-Friendly"],
    description: 'Aang glides through the air to reposition himself.',
    tags: [],
    unlockCondition: undefined,
  },
  {
    id: 'air_tornado',
    name: 'Air Tornado',
    type: 'attack',
    chiCost: 7,
    baseDamage: 3,
    cooldown: 3,
    critChance: 0.18,
    critMultiplier: 2.5,
    desperationBuff: { hpThreshold: 25, damageBonus: 2, defensePenalty: 5 },
    description: 'Aang summons a swirling tornado of air to batter his foe.',
    requiresPosition: ["neutral", "flying", "high_ground"],
    collateralDamage: 2,
    collateralDamageNarrative: "The force of the cyclone rips cobblestones from the ground and sends debris flying through the plaza.",
    tags: [],
    unlockCondition: undefined,
  },
  {
    id: 'wind_slice',
    name: 'Wind Slice',
    type: 'attack',
    chiCost: 5,
    baseDamage: 4,
    cooldown: 2,
    critChance: 0.15,
    critMultiplier: 2,
    description: 'A razor-sharp blade of wind that cuts through defenses.',
    requiresPosition: ["aggressive", "neutral"],
    appliesEffect: {
      type: 'DEFENSE_DOWN',
      chance: 0.5, // 50% chance to reduce defense
      duration: 2, // Defense down for 2 turns
      potency: 3 // Reduce defense by 3
    },
    tags: [],
    unlockCondition: undefined,
  },
  {
    id: 'air_shield',
    name: 'Air Shield',
    type: 'defense_buff',
    chiCost: 4,
    baseDamage: 0,
    cooldown: 4,
    description: 'A swirling barrier of air that boosts defense for 2 turns.',
    changesPosition: "defensive",
    appliesEffect: {
      type: 'DEFENSE_UP',
      chance: 1.0, // 100% chance to apply defense boost
      duration: 2, // Defense up for 2 turns
      potency: 5 // Increase defense by 5
    },
    tags: [],
    unlockCondition: undefined,
  },
  {
    id: 'charged_tornado',
    name: 'Charged Air Tornado',
    type: 'attack',
    chiCost: 8,
    baseDamage: 99, // Basically instant-win if lands
    cooldown: 8,
    maxUses: 1, // Only once per battle
    isChargeUp: true,
    chargeTime: 1,
    requiresPosition: ["neutral", "flying"],
    onlyIfEnemyState: ["repositioning", "stunned", "charging"],
    environmentalConstraints: ["Desert", "Open"],
    canBeInterrupted: true,
    chargeInterruptionPenalty: 5,
    description: 'Aang channels immense airbending power into a devastating tornado. Only usable when opponent is vulnerable.',
    collateralDamage: 3,
    collateralDamageNarrative: "The force of the cyclone rips cobblestones from the ground and shatters the facades of nearby buildings.",
    tags: [],
    unlockCondition: undefined,
  },
  {
    id: 'last_breath_cyclone',
    name: 'Last Breath Cyclone',
    type: 'attack',
    chiCost: 10,
    baseDamage: 25, // Increased base damage for finisher
    cooldown: 0, // No cooldown, it's a finisher
    maxUses: 1,
    isFinisher: true,
    oncePerBattle: true,
    finisherCondition: { type: 'hp_below', percent: 20 },
    description: 'Aang channels every last ounce of strength into a world-shaking cyclone. A battle-ending move.',
    collateralDamage: 3,
    collateralDamageNarrative: "The force of the cyclone rips cobblestones from the ground and shatters the facades of nearby buildings.",
    tags: [],
    unlockCondition: undefined,
  },
  {
    id: 'flowing_evasion',
    name: 'Flowing Evasion',
    type: 'evade',
    chiCost: 4,
    baseDamage: 0,
    cooldown: 3,
    maxUses: 4,
    description: 'Aang uses airbending to become like the wind, flowing around attacks with graceful evasion.',
    changesPosition: "defensive",
    environmentalConstraints: ["Open", "Air-Friendly"],
    positionBonus: {
      defensive: {
        defenseBonus: 10,
        chiCostReduction: 1
      }
    },
    tags: [],
    unlockCondition: undefined,
  }
];

// --- AZULA'S FIREBENDING MOVE SHEET ---

export const AZULA_MOVES: Move[] = [
  {
    id: 'basic_strike',
    name: 'Basic Strike',
    type: 'attack',
    chiCost: 0,
    baseDamage: 1,
    cooldown: 0,
    critChance: 0.10,
    critMultiplier: 2.5,
    description: 'Azula delivers a precise, calculated strike.',
    punishIfCharging: true,
    tags: [],
    unlockCondition: undefined,
  },
  {
    id: 'blue_fire',
    name: 'Blue Fire',
    type: 'attack',
    chiCost: 3,
    baseDamage: 3,
    cooldown: 2,
    critChance: 0.15,
    critMultiplier: 2.5,
    description: 'Azula unleashes her signature blue flames.',
    requiresPosition: ["aggressive", "neutral"],
    appliesEffect: {
      type: 'BURN',
      chance: 1.0, // 100% chance to apply burn (for testing)
      duration: 3, // Burn for 3 turns
      potency: 2 // 2 damage per turn
    },
    // NEW: Collateral damage properties
    collateralDamage: 1,
    collateralDamageNarrative: "The intense heat scorches nearby surfaces and leaves blackened marks on the stone.",
    tags: [],
    unlockCondition: undefined,
  },
  {
    id: 'fire_dash',
    name: 'Fire Dash',
    type: 'defense_buff',
    chiCost: 2,
    baseDamage: 0,
    cooldown: 2,
    changesPosition: "repositioning",
    repositionSuccessRate: 0.7, // Lower than Aang but still good
    environmentalConstraints: ["Open", "Fire-Friendly"],
    description: 'Azula uses fire propulsion to quickly reposition.',
    tags: [],
    unlockCondition: undefined,
  },
  {
    id: 'lightning',
    name: 'Lightning',
    type: 'attack',
    chiCost: 10,
    baseDamage: 99, // Instant kill, but see above
    cooldown: 10,
    maxUses: 1, // Only once per battle
    isChargeUp: true,
    chargeTime: 1,
    onlyIfEnemyState: ["repositioning", "stunned", "charging"],
    canBeInterrupted: true,
    chargeInterruptionPenalty: 8, // High penalty for failed lightning
    description: 'Azula channels lightning. Only usable when opponent is vulnerable.',
    // NEW: Collateral damage properties
    collateralDamage: 2,
    collateralDamageNarrative: "The bolt of lightning misses its primary target, striking a nearby statue and sending superheated shrapnel flying.",
    tags: [],
    unlockCondition: undefined,
  },
  {
    id: 'fire_shield',
    name: 'Fire Shield',
    type: 'defense_buff',
    chiCost: 4,
    baseDamage: 0,
    cooldown: 4,
    description: 'A protective barrier of blue flames.',
    changesPosition: "defensive",
    tags: [],
    unlockCondition: undefined,
  },
  {
    id: 'relentless_assault',
    name: 'Relentless Assault',
    type: 'attack',
    chiCost: 6,
    baseDamage: 5,
    cooldown: 5,
    description: 'A rapid series of fire attacks.',
    requiresPosition: ["aggressive"],
    positionBonus: {
      aggressive: {
        damageMultiplier: 1.5,
        chiCostReduction: 1,
      }
    },
    tags: [],
    unlockCondition: undefined,
  },
  {
    id: 'blazing_counter',
    name: 'Blazing Counter',
    type: 'parry_retaliate',
    chiCost: 5,
    baseDamage: 20,
    cooldown: 4,
    maxUses: 3,
    description: 'Azula uses a precise blast of fire to intercept an attack and create an opening for a devastating counter.',
    changesPosition: "defensive",
    environmentalConstraints: ["Open", "Fire-Friendly"],
    positionBonus: {
      defensive: {
        defenseBonus: 15,
        damageMultiplier: 1.2
      }
    },
    tags: [],
    unlockCondition: undefined,
  },
  {
    id: 'phoenix_inferno',
    name: 'Phoenix Inferno',
    type: 'attack',
    chiCost: 12,
    baseDamage: 30, // Increased base damage for finisher
    cooldown: 0,
    maxUses: 1,
    isFinisher: true,
    oncePerBattle: true,
    finisherCondition: { type: 'hp_below', percent: 20 },
    description: 'Azula channels all remaining energy into a devastating final attack. A battle-ending move.',
    collateralDamage: 3,
    collateralDamageNarrative: "The inferno engulfs the entire plaza, leaving nothing but scorched earth and melted stone in its wake.",
    tags: [],
    unlockCondition: undefined,
  },
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

// --- LOCATION TYPE MAPPING ---

export function getLocationType(location: string): LocationType {
  switch (location.toLowerCase()) {
    case "desert":
    case "si wong desert":
      return "Desert";
    case "fire nation throne room":
    case "palace":
    case "cave":
    case "underground":
      return "Enclosed";
    case "air temple":
    case "sky":
    case "mountain peak":
      return "Air-Friendly";
    case "ocean":
    case "river":
    case "waterfall":
      return "Water-Friendly";
    case "volcano":
    case "fire nation":
      return "Fire-Friendly";
    case "earth kingdom":
    case "ba sing se":
      return "Earth-Friendly";
    default:
      return "Open";
  }
}

// --- NEW: SUDDEN DEATH FINISHERS ---

export const AANG_SUDDEN_DEATH_FINISHER: Move = {
  id: 'final_tempest_finisher',
  name: 'Final Tempest',
  type: 'attack',
  chiCost: 0,
  baseDamage: 50, // Massive, almost guaranteed to be lethal
  cooldown: 0,
  isFinisher: true,
  // tags: ['sudden_death', 'finisher', 'ultimate'], // Remove if not in Move
  description: 'SUDDEN DEATH: Aang unleashes a final, uncontrolled storm of air, risking everything to end the fight.',
  desperationBuff: { hpThreshold: 100, damageBonus: 20, defensePenalty: 100 },
  tags: [],
  unlockCondition: undefined,
};

export const AZULA_SUDDEN_DEATH_FINISHER: Move = {
  id: 'comets_wrath_finisher',
  name: "Comet's Wrath",
  type: 'attack',
  chiCost: 0,
  baseDamage: 60,
  cooldown: 0,
  isFinisher: true,
  // tags: ['sudden_death', 'finisher', 'ultimate', 'piercing'], // Remove if not in Move
  description: 'SUDDEN DEATH: Azula channels the raw, destructive power of a comet, unleashing an inescapable inferno.',
  desperationBuff: { hpThreshold: 100, damageBonus: 25, defensePenalty: 100 },
  tags: [],
  unlockCondition: undefined,
}; 