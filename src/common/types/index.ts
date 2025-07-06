/**
 * @description Defines the static properties of a single ability.
 */
export type Ability = {
  name: string;
  type: 'attack' | 'defense_buff' | 'evade' | 'parry_retaliate';
  power: number; // Potency of the ability
  description: string;
  cooldown?: number; // Number of turns required after use (optional)
  chiCost?: number; // Resource cost for future extensibility (optional)
  maxUses?: number; // Maximum uses per battle (optional, e.g., 3 Lightning bolts)
  tags?: string[]; // For future categorization (e.g., 'piercing', 'defensive')
  collateralRisk?: number; // 0 = safe, 1 = catastrophic
  unlockCondition?: {
    type: 'health';
    threshold: number; // Health percentage (e.g., 20 for 20% health)
  };
  // New dramatic mechanics
  critChance?: number; // e.g. 0.1 = 10% chance
  critMultiplier?: number; // e.g. 3 = triple damage
  isFinisher?: boolean;
  oncePerBattle?: boolean;
  finisherCondition?: {
    type: 'hp_below' | 'phase';
    percent?: number;
    phase?: string;
  };
  desperationBuff?: {
    hpThreshold: number; // percent, e.g. 25
    damageBonus: number;
    defensePenalty: number;
  };
  // Status Effect System
  appliesEffect?: {
    type: 'DEFENSE_UP' | 'ATTACK_UP' | 'CRIT_CHANCE_UP' | 'HEAL_OVER_TIME' | 'BURN' | 'STUN' | 'DEFENSE_DOWN' | 'SLOW';
    chance: number; // Probability of applying the effect (0.0 to 1.0)
    duration: number; // How many turns the effect lasts
    potency: number; // Effect strength (damage per turn for BURN, % increase for buffs, etc.)
  };
  // NEW: Future-proofing for "mixup" attacks that counter specific defensive styles
  beatsDefenseType?: 'evade' | 'parry_retaliate';
};

/**
 * @description Represents a selectable character in the simulator, including their stats and abilities.
 */
export type Character = {
  id: string;
  name: string;
  image: string; // URL or path to image

  /** @description The primary bending art the character will use. */
  bending: 'air' | 'fire' | 'water' | 'earth' | 'avatar';

  /** @description Core combat statistics on a scale, e.g., 1-100. */
  stats: {
    power: number; // Offensive strength
    agility: number; // Speed and evasiveness
    defense: number; // Ability to block/mitigate damage
    intelligence: number; // Tactical and strategic skill
  };

  /** @description A list of key techniques the character can use. */
  abilities: Ability[];

  /** @description The default combat style or AI tendency. */
  personality: 'aggressive' | 'defensive' | 'balanced';
};

/**
 * @description Represents a selectable battle location.
 */
export type Location = {
  id: string;
  name: string;
  image: string; // URL or path to image
}; 