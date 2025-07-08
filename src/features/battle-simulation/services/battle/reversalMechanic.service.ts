/**
 * Reversal Mechanic Service
 * Determines if a reversal can be attempted and resolves the outcome.
 * Applies personality, trait, and location modifiers.
 */
import type { BattleCharacter } from '../../types';
import type { ReversalResult } from '../../types/mechanic.types';

export function resolveReversal({
  character,
}: {
  character: BattleCharacter;
}): ReversalResult | null {
  // Eligibility: must be compromised or low stability
  if (character.controlState !== 'Compromised' && character.stability > 15) return null;

  // Base chance
  let baseChance = 0.15;
  let source = '';

  // Character-specific logic (Aang, Azula)
  if (character.name === 'Aang') {
    baseChance += 0.15;
    source = 'Aang: Unique Reversal Logic';
    if (character.lastMove === 'plea_for_peace') {
      baseChance += 0.1;
      source += ' + Plea for Peace';
    }
  }
  if (character.name === 'Azula') {
    baseChance += 0.1;
    source = 'Azula: Unique Reversal Logic';
    // TODO: If you add reversalBonusFor to Location, uncomment below:
    // if (location.reversalBonusFor === 'Azula') {
    //   baseChance += 0.1;
    //   source += ' + Home Territory';
    // }
  }
  // TODO: Integrate behavioralTraits or other trait-based logic for more nuance

  // Roll for reversal
  if (Math.random() < baseChance) {
    const REVERSAL_SUCCESS_LINES = [
      `In a heartbeat, ${character.name} twists defeat into triumph, reversing the flow of battle.`,
      `With a surge of elemental force, ${character.name} turns the tables—one mistake becomes their opportunity.`,
      `Desperation sharpens to inspiration—${character.name} pivots, seizing the moment and upending their foe’s advantage.`,
      `A sudden spark—${character.name} reads their enemy’s intent, answers with perfect timing, and the duel’s momentum spins on its heel.`,
      `The tide shifts—${character.name} catches their rival off guard, turning defense into stunning offense.`
    ];
    return {
      effect: 'Reversal',
      narrative: REVERSAL_SUCCESS_LINES[Math.floor(Math.random() * REVERSAL_SUCCESS_LINES.length)],
      controlShift: 30,
      stabilityGain: 20,
      source,
    };
  }
  return null;
} 