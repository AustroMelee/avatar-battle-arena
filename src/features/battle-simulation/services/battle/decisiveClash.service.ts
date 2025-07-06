// CONTEXT: Battle, // FOCUS: DecisiveClash
import type { BattleState, BattleCharacter } from '../../types';

/**
 * Configuration for decisive clash mechanics.
 */
export interface DecisiveClashConfig {
  suddenDeathTurn: number; // Turn after which sudden death is possible
  collapseThreshold: number; // Control state or stability threshold for forced collapse
  enableMutualKO: boolean; // Allow mutual KO as outcome
}

export const DEFAULT_DECISIVE_CLASH_CONFIG: DecisiveClashConfig = {
  suddenDeathTurn: 40,
  collapseThreshold: 0,
  enableMutualKO: true,
};

/**
 * Checks if a decisive clash should be triggered and mutates the state accordingly.
 * Returns a result object describing the outcome.
 */
export function checkAndTriggerDecisiveClash(
  state: BattleState,
  config: DecisiveClashConfig = DEFAULT_DECISIVE_CLASH_CONFIG
): { triggered: boolean; outcome: 'none' | 'sudden_death' | 'collapse' | 'mutual_ko'; log: string } {
  const { suddenDeathTurn, collapseThreshold, enableMutualKO } = config;
  const [p1, p2] = state.participants;
  // Sudden death: after N turns, any hit is fatal
  if (state.turn >= suddenDeathTurn) {
    if (p1.stability <= collapseThreshold && p2.stability <= collapseThreshold && enableMutualKO) {
      // Both collapse
      p1.controlState = 'Defeated';
      p2.controlState = 'Defeated';
      state.isFinished = true;
      state.winner = null;
      return { triggered: true, outcome: 'mutual_ko', log: 'Both fighters collapse in a sudden death clash! The battle ends in a double KO.' };
    }
    if (p1.stability <= collapseThreshold) {
      p1.controlState = 'Defeated';
      state.isFinished = true;
      state.winner = p2;
      return { triggered: true, outcome: 'collapse', log: `${p1.name} collapses in sudden death! ${p2.name} wins by decisive clash.` };
    }
    if (p2.stability <= collapseThreshold) {
      p2.controlState = 'Defeated';
      state.isFinished = true;
      state.winner = p1;
      return { triggered: true, outcome: 'collapse', log: `${p2.name} collapses in sudden death! ${p1.name} wins by decisive clash.` };
    }
    // If both are still standing, next hit is fatal
    // This can be handled in move resolution: if sudden death is active, any impact triggers collapse
    return { triggered: true, outcome: 'sudden_death', log: 'Sudden death is active! Any hit may end the battle instantly.' };
  }
  return { triggered: false, outcome: 'none', log: '' };
} 