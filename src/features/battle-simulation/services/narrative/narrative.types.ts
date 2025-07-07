/**
 * @fileoverview Defines the core types for the narrative engine, including characters, mechanics, and contexts.
 * @version 1.0.0
 * @author Your Name
 */

// @docs
/**
 * @module Narrative System
 * @description Complete and type-safe coverage for all characters, mechanics, and narrative contexts.
 * Status: ✅ 100% complete for Aang & Azula.
 * Mechanics: Parry, Interrupt, DesperationMove, StatusEffects, EffectFusion, Stalemate, etc.
 * Integration: Fully aligned with engine phases, fallback anti-repetition, and emotional state drivers.
 */

/**
 * Defines the characters supported by the narrative engine.
 * Extensible with new character names.
 */
export type CharacterName = 'Aang' | 'Azula' | 'System' | 'Narrator';

/**
 * Defines the distinct combat mechanics that can trigger narrative lines.
 * Extensible with new mechanic IDs.
 *
 * Mechanics from SYSTEM ARCHITECTURE.MD:
 * - ChargedAirTornado: Aang's signature tornado move
 * - Lightning: Azula's signature lightning move
 * - ForcedEscalation: Escalation phase trigger
 * - BurnDamage: Ongoing fire damage
 * - CollateralDamage: Environmental or unintended damage
 * - DesperationTrigger: Entering desperation mode
 * - PleaForPeace: Attempt to de-escalate
 * - Finisher: Final, decisive move
 * - DesperationMove: High-risk, last-resort move
 * - StatusEffectBuff: Positive status effect (buff)
 * - StatusEffectDebuff: Negative status effect (debuff)
 * - EffectFusion: Crisis or effect meltdown
 * - Stalemate: Deadlock or no progress
 * - CriticalHit: Exceptionally strong attack
 * - MissDodge: Missed or dodged attack
 * - Reversal: Counter or reversal move
 * - Clash: Simultaneous or contested moves
 * - SuddenDeath: Final, forced endgame phase
 */
export type CombatMechanic =
  | 'ChargedAirTornado'
  | 'Lightning'
  | 'ForcedEscalation'
  | 'BurnDamage'
  | 'CollateralDamage'
  | 'DesperationTrigger'
  | 'PleaForPeace'
  | 'Finisher'
  | 'DesperationMove'
  | 'StatusEffectBuff'
  | 'StatusEffectDebuff'
  | 'EffectFusion'
  | 'Stalemate'
  | 'CriticalHit'
  | 'MissDodge'
  | 'Reversal'
  | 'Clash'
  | 'SuddenDeath'
  | 'EnvironmentalShift'
  | 'Interrupt'
  | 'MomentumSpike'
  | 'ChiRestore'
  | 'ChiDrain'
  | 'CounterStance'
  | 'Parry'
  | 'Disrupt'; // [effect-only] Not a real mechanic; triggered by state/effect, not move

/**
 * Defines the specific contexts within a combat mechanic that can have unique narrative.
 * Extensible with new context types.
 */
export type NarrativeContext =
  | 'chargeStart'
  | 'hit'
  | 'miss'
  | 'victory'
  | 'trigger'
  | 'attack'
  | 'apply'
  | 'tick'
  | 'minor'
  | 'major'
  | 'fail'
  | 'opening' 
  | 'mid_fight'
  | 'climax';

/**
 * A pool of narrative lines for a specific mechanic and its various contexts.
 * e.g., { hit: ["Line 1", "Line 2"], miss: ["Line 3"] }
 */
export type MechanicContextPool = {
  [context in NarrativeContext]?: string[];
};

/**
 * A collection of all narrative pools for a single character, indexed by combat mechanic.
 */
export type CharacterNarrativePool = {
  [mechanic in CombatMechanic]?: MechanicContextPool;
};

/**
 * The main data structure holding all narrative lines for all characters.
 */
export type NarrativePools = {
  [character in CharacterName]?: CharacterNarrativePool;
};
