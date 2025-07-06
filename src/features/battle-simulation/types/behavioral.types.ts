import { BattleState, BattleCharacter } from './index';

/**
 * The context object passed to a trait's trigger function, giving it
 * full awareness of the current battle situation.
 */
export interface TraitTriggerContext {
  self: BattleCharacter;
  opponent: BattleCharacter;
  state: BattleState;
  traitInstance?: BehavioralTraitInstance;
}

/**
 * A mechanical effect produced by a trait, designed to be processed by the engine.
 * Includes data for UI feedback (Suggestion A).
 */
export interface TraitEffect {
  type: 'apply_flag' | 'modify_stat';
  target: 'self' | 'opponent';
  flag?: string; // The flag to set, e.g., 'isManipulated'
  stat?: 'stability' | 'pride';
  value?: number; // e.g., -10 to reduce stability
  duration: number; // How many turns the effect lasts
  uiIcon: string; // e.g., '🧠' for Manipulated, '👑' for Overconfidence
  uiTooltip: string; // e.g., "Defense lowered due to manipulation."
}

/** The result of a triggered trait, including logs and mechanical effects. */
export interface TraitEffectResult {
  log: string;
  effects: TraitEffect[];
}

/**
 * A static definition of a behavioral trait. This is the "blueprint."
 * It's pure data and logic, unattached to any specific character instance.
 */
export interface BehavioralTrait {
  id: 'manipulation' | 'overconfidence' | 'plea_for_peace' | string; // string for future extensibility
  name: string;
  description: string;
  cooldown: number; // Turns before this trait can be considered again.
  isActive: (context: TraitTriggerContext) => boolean;
  onTrigger: (context: TraitTriggerContext) => TraitEffectResult;
  // For chaining traits, per Suggestion E
  triggersFollowUpTraitId?: BehavioralTrait['id'];
}

/** An instance of a trait attached to a character, with its own cooldown state. */
export interface BehavioralTraitInstance {
  traitId: BehavioralTrait['id'];
  lastTriggeredTurn: number;
}

/**
 * UI data for displaying behavioral effects
 */
export interface FlagUIData {
  icon: string;
  tooltip: string;
  color?: string;
}

/**
 * Active flag with duration tracking
 */
export interface ActiveFlag {
  duration: number;
  source: string; // e.g., "Manipulation"
  appliedTurn: number;
} 