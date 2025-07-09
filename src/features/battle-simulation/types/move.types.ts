// @docs
// @description: All move, ability, and finisher type definitions for Avatar Battle Arena. Registry/data-driven, plug-and-play architecture. No hard-coded logic. Extensible via data/registries only. SRP-compliant. See SYSTEM ARCHITECTURE.MD for integration points.
// @criticality: 💎 Types
// @owner: AustroMelee
// @tags: types, move, ability, registry, plug-and-play, extensibility, SRP
//
// All move types are designed for registry/data-driven extensibility. No engine changes required for new moves.
//
// Updated for 2025 registry-driven architecture overhaul.
/*
 * @file move.types.ts
 * @description Canonical type definitions for Move, Ability, and move-related data in the battle simulation.
 * This file should ONLY contain type definitions, not concrete data constants.
 */

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
  location: string;
  locationType: LocationType;
  selfPosition: Position;
  enemyPosition: Position;
  lastAction: string;
  isSelfStunned: boolean;
  isEnemyStunned: boolean;
  isSelfCharging: boolean;
  isEnemyCharging: boolean;
  selfChargeProgress?: number;
  enemyChargeProgress?: number;
  repositionAttempts: number;
  chargeInterruptions: number;
}

export type FinisherCondition =
  | { type: 'hp_below'; percent: number }
  | { type: 'phase'; phase: 'climax' | 'stalemate' }
  | { type: 'custom'; isAvailable: (ctx: BattleContext) => boolean };

export interface DesperationBuff {
  hpThreshold: number;
  damageBonus: number;
  defensePenalty: number;
}

export interface Move {
  id: string;
  name: string;
  type: 'attack' | 'defense_buff' | 'evade' | 'parry_retaliate' | 'charge';
  chiCost: number;
  baseDamage: number;
  cooldown: number;
  critChance?: number;
  critMultiplier?: number;
  isFinisher?: boolean;
  oncePerBattle?: boolean;
  finisherCondition?: FinisherCondition;
  desperationBuff?: DesperationBuff;
  description?: string;
  maxUses?: number;
  collateralDamage?: 0 | 1 | 2 | 3;
  collateralDamageNarrative?: string;
  beatsDefenseType?: 'evade' | 'parry_retaliate';
  requiresPosition?: Position[];
  changesPosition?: Position;
  isChargeUp?: boolean;
  chargeTime?: number;
  canBeInterrupted?: boolean;
  onlyIfEnemyState?: ("repositioning" | "stunned" | "charging")[];
  punishIfCharging?: boolean;
  environmentalConstraints?: LocationType[];
  repositionSuccessRate?: number;
  chargeInterruptionPenalty?: number;
  positionBonus?: {
    [key in Position]?: {
      damageMultiplier?: number;
      defenseBonus?: number;
      chiCostReduction?: number;
    };
  };
  appliesEffect?: {
    type: 'DEFENSE_UP' | 'ATTACK_UP' | 'CRIT_CHANCE_UP' | 'HEAL_OVER_TIME' | 'BURN' | 'STUN' | 'DEFENSE_DOWN' | 'SLOW';
    chance: number;
    duration: number;
    potency: number;
  };
  tags?: string[];
  unlockCondition?: { type: 'health'; threshold: number };
  /**
   * @description If true, this move is considered a basic/fallback move and is subject to staleness filtering and escalation lockouts.
   */
  isBasic?: boolean;
  releaseMoveId?: string;
}

export type ImpactClass = 'minor' | 'moderate' | 'severe';

export interface Ability {
  id: string;
  name: string;
  type: 'attack' | 'disruption' | 'positioning' | 'deception';
  impactClass: ImpactClass;
  disruptsOnHit?: boolean;
  description: string;
}

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