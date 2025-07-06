/**
 * Defines a character's core psychological and philosophical traits.
 * This is static data that does not change during a battle.
 */
export interface IdentityProfile {
  characterName: string;
  // Core values that drive behavior
  coreValues: ('control' | 'dominance' | 'balance' | 'pacifism' | 'survival')[];
  // How the character acts under pressure
  tacticalTendencies: ('prefers_precision' | 'escalates_under_pressure' | 'avoids_retreat' | 'prefers_evasion')[];
  // The character's moral stance on combat
  moralBoundaries: 'lethal' | 'non-lethal';
  // How much a character's pride can be damaged before it affects their state (0-100)
  prideTolerance: number;
  // A self-imposed penalty for using defensive or retreat moves when not necessary
  retreatPenalty: number;
}

/**
 * Tracks the dynamic, in-battle mental state of a character.
 * This object will be updated every turn.
 */
export interface MentalState {
  stability: number; // 0-100. High is calm/composed, low is unhinged/panicked.
  pride: number;     // 0-100. A measure of ego. Taking hits or being outplayed lowers it.
  activeStates: ('enraged' | 'fearful' | 'focused' | 'unhinged')[];
}

/**
 * How a character perceives their opponent. This is their subjective belief.
 */
export interface OpponentPerception {
  aggressionLevel: number; // How aggressive they believe the opponent is (0-100)
  predictability: number;  // How predictable they believe the opponent is (0-100)
  respect: number;         // How much they respect the opponent's skill (0-100)
}

/**
 * Score adjustments applied to moves based on identity and mental state.
 */
export interface IdentityScoreAdjustment {
  adjustment: number;
  reason: string;
}

/**
 * Collection of score adjustments for all available moves.
 */
export type ScoreAdjustments = Record<string, IdentityScoreAdjustment>; 