// CONTEXT: AI Intent and Goal System
// RESPONSIBILITY: Set tactical intent to drive move selection for multiple turns
import { BattleTacticalContext } from './battleStateAwareness';

/**
 * @description Types of tactical intent that guide AI decision making.
 */
export type IntentType =
  | 'break_defense'
  | 'go_for_finish'
  | 'defend'
  | 'stall'
  | 'restore_chi'
  | 'standard_attack'
  | 'wait_and_see'
  | 'pressure_enemy'
  | 'counter_attack'
  | 'build_momentum'
  | 'desperate_attack'
  | 'conservative_play';

/**
 * @description Represents a tactical intent with description and priority.
 */
export interface Intent {
  type: IntentType;
  description: string;
  priority: number; // 1-10, higher is more urgent
  expectedDuration: number; // Expected turns this intent should last
}

/**
 * @description Chooses the most appropriate tactical intent based on battle context.
 * @param {BattleTacticalContext} context - The current battle context.
 * @returns {Intent} The chosen tactical intent.
 */
export function chooseIntent(context: BattleTacticalContext): Intent {
  // Emergency situations (highest priority)
  if (context.healthPressure && context.enemyBurstThreat) {
    return {
      type: 'defend',
      description: 'Critical health and enemy has burst threat. Defend at all costs.',
      priority: 10,
      expectedDuration: 2
    };
  }
  
  if (context.healthPressure && context.isLosing) {
    return {
      type: 'desperate_attack',
      description: 'Low health and losing. Go for broke with maximum damage.',
      priority: 9,
      expectedDuration: 1
    };
  }
  
  // Resource management
  if (context.chiPressure) {
    return {
      type: 'restore_chi',
      description: 'Low on chi. Use low-cost moves and stall to recover.',
      priority: 8,
      expectedDuration: 2
    };
  }
  
  // Tactical opportunities
  if (context.enemyIsTurtling && context.burstAvailable) {
    return {
      type: 'break_defense',
      description: 'Enemy is turtling and we have burst. Break through their defense.',
      priority: 7,
      expectedDuration: 2
    };
  }
  
  if (context.enemyVulnerable && context.burstAvailable) {
    return {
      type: 'go_for_finish',
      description: 'Enemy is vulnerable and we have finishing power. End the fight!',
      priority: 7,
      expectedDuration: 1
    };
  }
  
  if (context.enemyVulnerable && !context.burstAvailable) {
    return {
      type: 'pressure_enemy',
      description: 'Enemy is vulnerable. Apply pressure with available moves.',
      priority: 6,
      expectedDuration: 2
    };
  }
  
  // Momentum and positioning
  if (context.hasMomentum && context.burstAvailable) {
    return {
      type: 'build_momentum',
      description: 'We have momentum and burst. Keep the pressure on.',
      priority: 6,
      expectedDuration: 2
    };
  }
  
  if (context.isDominating && !context.enemyBurstThreat) {
    return {
      type: 'standard_attack',
      description: 'We are dominating. Continue with standard attacks.',
      priority: 4,
      expectedDuration: 3
    };
  }
  
  // Defensive situations
  if (context.enemyBurstThreat && !context.healthPressure) {
    return {
      type: 'defend',
      description: 'Enemy has burst threat. Prepare defensive stance.',
      priority: 6,
      expectedDuration: 2
    };
  }
  
  if (context.isLosing && !context.healthPressure) {
    return {
      type: 'stall',
      description: 'Currently losing. Play defensively and look for opportunities.',
      priority: 5,
      expectedDuration: 3
    };
  }
  
  // Counter-attack opportunities
  if (context.enemyPattern === 'aggressive' && context.myDefense > 15) {
    return {
      type: 'counter_attack',
      description: 'Enemy is aggressive and we have defense. Counter-attack.',
      priority: 5,
      expectedDuration: 2
    };
  }
  
  // Conservative play
  if (context.isEarlyGame && !context.hasMomentum) {
    return {
      type: 'conservative_play',
      description: 'Early game, no momentum. Play conservatively and gather information.',
      priority: 3,
      expectedDuration: 3
    };
  }
  
  // Default fallback
  return {
    type: 'standard_attack',
    description: 'Proceed with standard attacks.',
    priority: 3,
    expectedDuration: 2
  };
}

/**
 * @description Gets the priority score for an intent type based on context.
 * @param {IntentType} intentType - The type of intent.
 * @param {BattleTacticalContext} context - The battle context.
 * @returns {number} The priority score (0-10).
 */
export function getIntentPriority(intentType: IntentType, context: BattleTacticalContext): number {
  switch (intentType) {
    case 'defend':
      return context.healthPressure ? 10 : 6;
    case 'desperate_attack':
      return context.healthPressure && context.isLosing ? 9 : 4;
    case 'restore_chi':
      return context.chiPressure ? 8 : 2;
    case 'break_defense':
      return context.enemyIsTurtling ? 7 : 3;
    case 'go_for_finish':
      return context.enemyVulnerable ? 7 : 3;
    case 'pressure_enemy':
      return context.enemyVulnerable ? 6 : 3;
    case 'build_momentum':
      return context.hasMomentum ? 6 : 3;
    case 'counter_attack':
      return context.enemyPattern === 'aggressive' ? 5 : 2;
    case 'stall':
      return context.isLosing ? 5 : 2;
    case 'conservative_play':
      return context.isEarlyGame ? 3 : 1;
    case 'standard_attack':
      return 3;
    case 'wait_and_see':
      return 2;
    default:
      return 3;
  }
}

/**
 * @description Checks if the current intent should be maintained or changed.
 * @param {Intent} currentIntent - The current tactical intent.
 * @param {BattleTacticalContext} context - The current battle context.
 * @returns {boolean} True if the intent should be maintained.
 */
export function shouldMaintainIntent(currentIntent: Intent, context: BattleTacticalContext): boolean {
  // Check if the intent's conditions are still met
  switch (currentIntent.type) {
    case 'defend':
      return context.healthPressure || context.enemyBurstThreat;
    case 'restore_chi':
      return context.chiPressure;
    case 'break_defense':
      return context.enemyIsTurtling;
    case 'go_for_finish':
      return context.enemyVulnerable;
    case 'pressure_enemy':
      return context.enemyVulnerable;
    case 'build_momentum':
      return context.hasMomentum;
    case 'stall':
      return context.isLosing;
    case 'desperate_attack':
      return context.healthPressure && context.isLosing;
    case 'counter_attack':
      return context.enemyPattern === 'aggressive';
    case 'conservative_play':
      return context.isEarlyGame;
    default:
      return true; // Maintain standard attacks by default
  }
} 