// CONTEXT: BattleSimulation, // FOCUS: ArcTransitions
import { BattleState, BattleArcState, ArcTransition } from '../types';

/**
 * Helper to prevent going backward in the timeline
 * @param state - Current battle state
 * @param targetState - State to check if already passed
 * @returns True if the target state has already been reached
 */
const hasAlreadyPassed = (state: BattleState, targetState: BattleArcState): boolean => {
  return state.arcStateHistory.includes(targetState);
};

/**
 * Arc transition rules with priority-based evaluation.
 * Higher priority transitions are checked first and can override lower priority ones.
 */
export const ARC_TRANSITIONS: ArcTransition[] = [
  // --- HIGHEST PRIORITY: EDGE CASE TRANSITIONS ---
  {
    from: BattleArcState.Climax,
    to: BattleArcState.Twilight,
    priority: 100,
    condition: (state) => 
      state.participants.every(p => p.currentHealth <= 10) && 
      !hasAlreadyPassed(state, BattleArcState.Twilight),
    narrative: "Both fighters are on the brink of collapse! The air grows still as they enter a final, desperate twilight showdown.",
  },
  {
    from: BattleArcState.FallingAction,
    to: BattleArcState.Twilight,
    priority: 100,
    condition: (state) => 
      state.participants.every(p => p.currentHealth <= 15) && 
      !hasAlreadyPassed(state, BattleArcState.Twilight),
    narrative: "The battle takes an unexpected turn as both combatants find themselves in a desperate twilight struggle!",
  },

  // --- HIGH PRIORITY: DRAMATIC ESCALATION TRANSITIONS ---
  {
    from: BattleArcState.Opening,
    to: BattleArcState.Climax,
    priority: 10,
    condition: (state) => 
      state.participants.some(p => p.currentHealth < 40) && 
      !hasAlreadyPassed(state, BattleArcState.Climax),
    narrative: "An early, devastating blow pushes the fight straight to a critical climax!",
  },
  {
    from: BattleArcState.RisingAction,
    to: BattleArcState.Climax,
    priority: 10,
    condition: (state) => 
      state.participants.some(p => p.currentHealth < 40) && 
      !hasAlreadyPassed(state, BattleArcState.Climax),
    narrative: "The battle suddenly escalates as a fighter is pushed to their limit!",
  },
  {
    from: BattleArcState.Opening,
    to: BattleArcState.FallingAction,
    priority: 10,
    condition: (state) => 
      state.participants.some(p => p.currentHealth < 20) && 
      !hasAlreadyPassed(state, BattleArcState.FallingAction),
    narrative: "A catastrophic early strike sends the battle into a desperate falling action!",
  },

  // --- MEDIUM PRIORITY: STANDARD PROGRESSION (with reversion prevention) ---
  {
    from: BattleArcState.Opening,
    to: BattleArcState.RisingAction,
    priority: 5,
    condition: (state) => 
      state.turn > 5 && 
      !hasAlreadyPassed(state, BattleArcState.RisingAction),
    narrative: "The initial probing ends; the real battle begins!",
  },
  {
    from: BattleArcState.RisingAction,
    to: BattleArcState.Climax,
    priority: 5,
    condition: (state) => 
      state.turn > 18 && 
      !hasAlreadyPassed(state, BattleArcState.Climax),
    narrative: "The combatants are wearing down; the fight is reaching its peak!",
  },
  {
    from: BattleArcState.Climax,
    to: BattleArcState.FallingAction,
    priority: 5,
    condition: (state) => 
      state.participants.some(p => p.currentHealth < 30) && 
      !hasAlreadyPassed(state, BattleArcState.FallingAction),
    narrative: "The climax has passed; the battle enters its final, desperate phase!",
  },
  {
    from: BattleArcState.FallingAction,
    to: BattleArcState.Resolution,
    priority: 5,
    condition: (state) => 
      state.participants.some(p => p.currentHealth < 10) && 
      !hasAlreadyPassed(state, BattleArcState.Resolution),
    narrative: "The battle reaches its inevitable conclusion!",
  },

  // --- LOW PRIORITY: TIME-BASED FALLBACKS ---
  {
    from: BattleArcState.Opening,
    to: BattleArcState.RisingAction,
    priority: 1,
    condition: (state) => 
      state.turn > 10 && 
      !hasAlreadyPassed(state, BattleArcState.RisingAction),
    narrative: "The opening phase has drawn on long enough; the battle must progress!",
  },
  {
    from: BattleArcState.RisingAction,
    to: BattleArcState.Climax,
    priority: 1,
    condition: (state) => 
      state.turn > 25 && 
      !hasAlreadyPassed(state, BattleArcState.Climax),
    narrative: "The rising action has peaked; the battle must reach its climax!",
  },
  {
    from: BattleArcState.Climax,
    to: BattleArcState.FallingAction,
    priority: 1,
    condition: (state) => 
      state.turn > 35 && 
      !hasAlreadyPassed(state, BattleArcState.FallingAction),
    narrative: "The climax has endured; the battle must begin its resolution!",
  },
  {
    from: BattleArcState.FallingAction,
    to: BattleArcState.Resolution,
    priority: 1,
    condition: (state) => 
      state.turn > 45 && 
      !hasAlreadyPassed(state, BattleArcState.Resolution),
    narrative: "The falling action has reached its limit; the battle must resolve!",
  },
];

/**
 * Gets the default arc state for a new battle
 * @returns The initial arc state
 */
export function getDefaultArcState(): BattleArcState {
  return BattleArcState.Opening;
}

/**
 * Gets the arc state history for a new battle
 * @returns Initial arc state history
 */
export function getDefaultArcStateHistory(): BattleArcState[] {
  return [BattleArcState.Opening];
} 