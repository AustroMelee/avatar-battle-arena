// Used via dynamic registry in battle engine. See SYSTEM ARCHITECTURE.MD for flow.
/*
 * @file arc.service.ts
 * @description Manages the battle arc state machine and escalation triggers for the simulation.
 * @criticality 🩸 Battle Arc
 * @owner AustroMelee
 * @lastUpdated 2025-07-08
 * @related processTurn.ts, state.ts
 */
// CONTEXT: BattleSimulation, // FOCUS: ArcStateEngine
import { BattleState, BattleArcState, ArcStateModifier, BattleLogEntry } from '../../types';
import { ARC_TRANSITIONS } from '../../data/arcTransitions';
import { logMechanics } from '../utils/mechanicLogUtils';
import { nes } from '@/common/branding/nonEmptyString';

// For developer controls - can be overridden for testing
const IS_DEV_MODE = false; // Set to true in development

/**
 * Injected trigger for designer control during development
 */
export interface InjectedArcTrigger {
  to: BattleArcState;
  narrative: string;
  reason?: string; // Optional reason for the injection
}

/**
 * Result of arc state update operation
 */
export interface ArcStateUpdateResult {
  newState: BattleState;
  logEntry: BattleLogEntry | null;
  transitionOccurred: boolean;
  previousState: BattleArcState;
}

/**
 * Creates a battle log entry for arc state transitions
 * @param turn - Current turn number
 * @param fromState - Previous arc state
 * @param toState - New arc state
 * @param narrative - Transition narrative
 * @param isInjected - Whether this was an injected transition
 * @returns Battle log entry
 */
function createArcTransitionLogEntry(
  turn: number,
  _fromState: BattleArcState,
  _toState: BattleArcState,
  narrative: string
): BattleLogEntry {
  const log = logMechanics({
    turn: turn,
    text: 'System: Arc state changed.'
  });
  if (log) return log;
  return {
    id: 'arc-fallback',
    turn: turn,
    actor: 'System',
    type: 'mechanics',
    action: 'Arc Transition',
    result: nes(narrative),
    target: undefined,
    narrative: nes(''),
    timestamp: Date.now(),
    details: undefined
  };
}

/**
 * Validates battle state for arc state operations
 * @param state - Battle state to validate
 * @throws TypeError if state is invalid
 */
function validateBattleState(state: BattleState): void {
  if (!state.participants || state.participants.length < 2) {
    throw new TypeError('Battle state must have at least 2 participants');
  }
  
  if (state.turn < 1) {
    throw new TypeError('Turn number must be positive');
  }
  
  if (!state.arcState) {
    throw new TypeError('Battle state must have an arc state');
  }
  
  if (!state.arcStateHistory || !Array.isArray(state.arcStateHistory)) {
    throw new TypeError('Battle state must have arc state history array');
  }
}

/**
 * Checks for and applies a state transition if conditions are met.
 * @param state - Current battle state
 * @param injectedTrigger - Optional injected trigger for designer control
 * @returns The new state and a log entry if a transition occurred
 */
export function updateArcState(
  state: BattleState,
  injectedTrigger?: InjectedArcTrigger
): ArcStateUpdateResult {
  // Validate input
  validateBattleState(state);
  
  const previousState = state.arcState;
  
  // --- 1. Handle Injected Triggers (Developer Control) ---
  if (injectedTrigger) {
    if (state.arcStateHistory.includes(injectedTrigger.to)) {
      if (IS_DEV_MODE) {
        console.warn(`[ARC_STATE] DEV WARNING: Cannot inject transition to ${injectedTrigger.to} - already passed`);
      }
      return {
        newState: state,
        logEntry: null,
        transitionOccurred: false,
        previousState,
      };
    }
    
    const newState: BattleState = {
      ...state,
      arcState: injectedTrigger.to,
      arcStateHistory: [...state.arcStateHistory, injectedTrigger.to],
    };
    
    const logEntry = createArcTransitionLogEntry(
      state.turn,
      previousState,
      injectedTrigger.to,
      injectedTrigger.narrative
    );
    
    if (IS_DEV_MODE) {
      console.log(`[ARC_STATE] DEV INJECT: Transition to ${injectedTrigger.to} forced. Reason: ${injectedTrigger.reason || 'Designer control'}`);
    }
    
    return {
      newState,
      logEntry,
      transitionOccurred: true,
      previousState,
    };
  }

  // --- 2. Evaluate Normal Transitions ---
  const possibleTransitions = ARC_TRANSITIONS
    .filter(t => t.from === state.arcState)
    .sort((a, b) => b.priority - a.priority); // Higher priority first

  for (const transition of possibleTransitions) {
    try {
      const conditionMet = transition.condition(state);

      if (IS_DEV_MODE) {
        console.log(`[ARC_STATE] Checked transition: ${transition.from} -> ${transition.to}, Priority: ${transition.priority}, Condition met: ${conditionMet}`);
      }

      if (conditionMet) {
        const newState: BattleState = {
          ...state,
          arcState: transition.to,
          arcStateHistory: [...state.arcStateHistory, transition.to],
        };
        
        const logEntry = createArcTransitionLogEntry(
          state.turn,
          previousState,
          transition.to,
          transition.narrative
        );
        
        if (IS_DEV_MODE) {
          console.log(`[ARC_STATE] Transition executed: ${transition.from} -> ${transition.to}`);
        }
        
        return {
          newState,
          logEntry,
          transitionOccurred: true,
          previousState,
        };
      }
    } catch { /* intentionally empty: continue to next transition */ }
  }

  return {
    newState: state,
    logEntry: null,
    transitionOccurred: false,
    previousState,
  };
}

/**
 * Gets the global modifiers for the current battle arc state.
 * This function returns a comprehensive set of modifiers that affect all aspects of battle.
 * @param arcState - The current arc state
 * @returns Arc state modifiers
 */
export function getArcModifiers(arcState: BattleArcState): ArcStateModifier {
  switch (arcState) {
    case BattleArcState.Opening:
      return {
        damageBonus: 1.0,
        defenseBonus: 0,
        chiRegenBonus: 0,
        statusEffectDurationModifier: 1.0,
        aiRiskFactor: 0.8, // AI is more conservative in opening
        unlocksFinishers: false,
      };
      
    case BattleArcState.RisingAction:
      return {
        damageBonus: 1.05,
        defenseBonus: 0,
        chiRegenBonus: 0.5,
        statusEffectDurationModifier: 1.0,
        aiRiskFactor: 1.0, // Normal AI behavior
        unlocksFinishers: false,
      };
      
    case BattleArcState.Climax:
      return {
        damageBonus: 1.1,
        defenseBonus: 0,
        chiRegenBonus: 1,
        statusEffectDurationModifier: 0.75, // Status effects last 25% shorter
        aiRiskFactor: 1.5, // AI becomes 50% more aggressive
        unlocksFinishers: true,
      };
      
    case BattleArcState.FallingAction:
      return {
        damageBonus: 1.2,
        defenseBonus: -0.1, // Slight defense penalty
        chiRegenBonus: 1.5,
        statusEffectDurationModifier: 0.5, // Status effects last 50% shorter
        aiRiskFactor: 1.8, // AI becomes very aggressive
        unlocksFinishers: true,
      };
      
    case BattleArcState.Resolution:
      return {
        damageBonus: 1.3,
        defenseBonus: -0.2, // Larger defense penalty
        chiRegenBonus: 2,
        statusEffectDurationModifier: 0.25, // Status effects last 75% shorter
        aiRiskFactor: 2.0, // AI becomes extremely aggressive
        unlocksFinishers: true,
      };
      
    case BattleArcState.Twilight:
      return {
        damageBonus: 1.5,
        defenseBonus: -0.25, // Significant defense penalty
        chiRegenBonus: 2,
        statusEffectDurationModifier: 1.0, // Normal status effect duration
        aiRiskFactor: 2.0, // Maximum AI aggression
        unlocksFinishers: true,
      };
      
    default:
      // Fallback for unknown states
      return {
        damageBonus: 1.0,
        defenseBonus: 0,
        chiRegenBonus: 0,
        statusEffectDurationModifier: 1.0,
        aiRiskFactor: 1.0,
        unlocksFinishers: false,
      };
  }
}

/**
 * Gets a human-readable description of the current arc state
 * @param arcState - The arc state to describe
 * @returns Description of the arc state
 */
export function getArcStateDescription(arcState: BattleArcState): string {
  switch (arcState) {
    case BattleArcState.Opening:
      return "The battle begins with cautious probing and testing of defenses.";
    case BattleArcState.RisingAction:
      return "The combatants begin to engage more seriously, building momentum.";
    case BattleArcState.Climax:
      return "The battle reaches its peak intensity with powerful techniques unleashed.";
    case BattleArcState.FallingAction:
      return "The fighters are exhausted but desperate, using their final reserves.";
    case BattleArcState.Resolution:
      return "The battle nears its conclusion with one final push for victory.";
    case BattleArcState.Twilight:
      return "Both fighters are on the brink of collapse in a desperate final struggle.";
    default:
      return "The battle arc state is unknown.";
  }
}

/**
 * Gets the arc state progression for debugging and analysis
 * @param state - Battle state
 * @returns Arc state progression information
 */
export function getArcStateProgression(state: BattleState): {
  currentState: BattleArcState;
  history: BattleArcState[];
  progression: string;
  canTransitionTo: BattleArcState[];
} {
  const currentState = state.arcState;
  const history = state.arcStateHistory;
  
  // Get possible next states
  const possibleTransitions = ARC_TRANSITIONS
    .filter(t => t.from === currentState)
    .map(t => t.to);
  
  const uniqueNextStates = [...new Set(possibleTransitions)];
  
  return {
    currentState,
    history,
    progression: history.join(' → '),
    canTransitionTo: uniqueNextStates,
  };
} 