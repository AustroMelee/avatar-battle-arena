/**
 * @description Defines the static properties of a single ability.
 */
export type Ability = {
  name: string;
  type: 'attack' | 'defense_buff';
  power: number; // Potency of the ability
  description: string;
  cooldown?: number; // Number of turns required after use (optional)
  chiCost?: number; // Resource cost for future extensibility (optional)
  tags?: string[]; // For future categorization (e.g., 'piercing', 'defensive')
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