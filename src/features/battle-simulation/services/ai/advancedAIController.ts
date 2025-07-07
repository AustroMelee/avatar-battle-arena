// CONTEXT: Advanced AI Controller
// RESPONSIBILITY: Integrate battle awareness, intent system, and contextual move scoring
import { Ability, Location } from '@/common/types';
import { BattleCharacter, AILogEntry, PerceivedState, ConsideredAction, BattleLogEntry } from '../../types';
import { getBattleTacticalContext, BattleTacticalContext } from './battleStateAwareness';
import { chooseIntent, Intent, shouldMaintainIntent } from './intentSystem';
import { scoreMovesWithContext, ContextualMoveScore } from './contextualMoveScoring';
import { getAvailableMoves } from '../utils/moveUtils';
import { assessMetaState } from './metaState';

/**
 * @description Enhanced AI decision state that includes context and intent.
 */
export interface AdvancedAIState {
  context: BattleTacticalContext;
  intent: Intent;
  intentTurnCount: number; // How many turns we've been following this intent
  lastIntentChange: number; // Turn when intent was last changed
}

/**
 * @description Creates a perceived state for AI decision making with enhanced context.
 * @param {BattleCharacter} self - The AI character making the decision.
 * @param {BattleCharacter} enemy - The enemy character.
 * @param {number} turn - Current turn number.
 * @param {BattleContext} context - The battle context.
 * @param {Intent} intent - The current tactical intent.
 * @returns {PerceivedState} The enhanced perceived state.
 */
function createEnhancedPerceivedState(
  self: BattleCharacter, 
  enemy: BattleCharacter, 
  turn: number
): PerceivedState {
  // TODO: Replace placeholder values with real character state logic
  return {
    self: {
      health: self.currentHealth,
      defense: self.currentDefense,
      personality: self.personality,
      abilities: self.abilities.map(ability => ({
        id: ability.name.toLowerCase().replace(/\s+/g, '_'),
        name: ability.name,
        type: ability.type,
        power: ability.power,
        cooldown: ability.cooldown
      })),
      cooldowns: self.cooldowns,
      lastMove: self.lastMove,
      moveHistory: self.moveHistory,
      activeEffects: self.activeEffects,
      resources: self.resources,
      position: self.position ?? { x: 0, y: 0 },
      isCharging: self.isCharging ?? false,
      chargeProgress: self.chargeProgress ?? 0,
      repositionAttempts: self.repositionAttempts ?? 0
    },
    enemy: {
      health: enemy.currentHealth,
      defense: enemy.currentDefense,
      personality: enemy.personality,
      name: enemy.name,
      lastMove: enemy.lastMove,
      moveHistory: enemy.moveHistory,
      activeEffects: enemy.activeEffects,
      position: enemy.position ?? { x: 0, y: 0 },
      isCharging: enemy.isCharging ?? false,
      chargeProgress: enemy.chargeProgress ?? 0,
      repositionAttempts: enemy.repositionAttempts ?? 0
    },
    round: turn,
    cooldowns: {}, // Legacy field - can be removed after migration
    location: 'Fire Nation Throne Hall', // TODO: Replace with real location
    locationType: 'Enclosed'
  };
}

/**
 * @description Chooses an ability using the advanced AI system with context awareness and tactical intent.
 * @param {BattleCharacter} character - The character choosing the ability.
 * @param {BattleCharacter} enemy - The enemy character.
 * @param {number} turn - Current turn number.
 * @param {BattleLogEntry[]} battleLog - The battle log entries.
 * @param {Location} location - The battle location for collateral damage checks.
 * @param {AdvancedAIState | null} previousState - The previous AI state (for intent continuity).
 * @returns {{ability: Ability; aiLog: AILogEntry; newState: AdvancedAIState}} The chosen ability, AI log, and new state.
 */
export function chooseAbilityWithAdvancedAI(
  character: BattleCharacter, 
  enemy: BattleCharacter, 
  turn: number,
  battleLog: BattleLogEntry[],
  location: Location,
  previousState: AdvancedAIState | null = null
): { ability: Ability; aiLog: AILogEntry; newState: AdvancedAIState } {
  
  const context = getBattleTacticalContext(character, enemy, battleLog);
  
  let intent: Intent;
  let intentTurnCount: number;
  
  if (previousState && shouldMaintainIntent(previousState.intent, context)) {
    intent = previousState.intent;
    intentTurnCount = previousState.intentTurnCount + 1;
  } else {
    intent = chooseIntent(context);
    intentTurnCount = 1;
  }
  
  const meta = assessMetaState(character, enemy, turn);
  const availableMoves = getAvailableMoves(character, meta, location, turn);
  
  if (availableMoves.length === 0) {
    // Handle no available moves fallback
    const fallbackAbility = character.abilities.find(a => a.name === "Basic Strike") || character.abilities[0];
    let lastIntentChange: number;
    if (intentTurnCount === 1) {
      lastIntentChange = turn;
    } else {
      lastIntentChange = previousState?.lastIntentChange ?? turn;
    }
    return {
        ability: fallbackAbility,
        newState: { context, intent, intentTurnCount, lastIntentChange },
        aiLog: { /* ... create a fallback log ... */ } as any,
    };
  }

  const scoredMoves = scoreMovesWithContext(
    availableMoves, 
    character, 
    enemy, 
    context, 
    intent
  );
  
  const bestMove = scoredMoves[0];

  const aiLog: AILogEntry = {
    turn,
    agent: character.name,
    reasoning: `Intent: ${intent.type}. Reasons: ${bestMove.reasons.join('. ')}`,
    chosenAction: bestMove.move.name,
    consideredActions: scoredMoves.slice(0, 3).map(sm => ({
        move: sm.move.name,
        score: sm.score,
        reason: sm.reasons.join(', '),
        abilityId: sm.move.name,
    })),
    perceivedState: { /* ... populate this ... */ } as any,
    timestamp: Date.now()
  };

  let lastIntentChange: number;
  if (intentTurnCount === 1) {
    lastIntentChange = turn;
  } else {
    lastIntentChange = previousState?.lastIntentChange ?? turn;
  }

  const newState: AdvancedAIState = {
    context,
    intent,
    intentTurnCount,
    lastIntentChange,
  };
  
  return { ability: bestMove.move, aiLog, newState };
}

/**
 * @description Builds an advanced narrative for the chosen move incorporating context and intent.
 * @param {BattleCharacter} character - The character making the move.
 * @param {Ability} move - The chosen move.
 * @param {BattleTacticalContext} context - The battle context.
 * @param {Intent} intent - The tactical intent.
 * @param {ContextualMoveScore} moveScore - The move score details.
 * @returns {string} The narrative description.
 */
function buildAdvancedMoveNarrative(
  character: BattleCharacter,
  move: Ability,
  context: BattleTacticalContext,
  intent: Intent,
  moveScore: ContextualMoveScore
): string {
  const characterName = character.name;
  const moveName = move.name;
  const intentType = intent.type;
  
  // Base narrative based on intent
  let narrative = `${characterName} follows their ${intentType.replace('_', ' ')} strategy`;
  
  // Add context-specific details
  if (context.enemyVulnerable && (move.type === 'attack' || move.type === 'parry_retaliate')) {
    narrative += `, seizing the opportunity while ${context.enemyHealth < 20 ? 'the enemy is critically wounded' : 'the enemy is vulnerable'}`;
  }
  
  if (context.healthPressure && (move.type === 'defense_buff' || move.type === 'evade')) {
    narrative += `, desperately trying to survive with ${character.currentHealth} health remaining`;
  }
  
  if (context.enemyIsTurtling && (move.type === 'attack' || move.type === 'parry_retaliate')) {
    narrative += `, attempting to break through the enemy's defensive stance`;
  }
  
  if (context.hasMomentum && (move.type === 'attack' || move.type === 'parry_retaliate')) {
    narrative += `, building on their momentum`;
  }
  
  if (context.chiPressure && (move.chiCost || 0) === 0) {
    narrative += `, conserving their dwindling chi reserves`;
  }
  
  // Add move-specific details
  if (move.power > 40) {
    narrative += ` with a powerful ${moveName}`;
  } else if (move.power > 20) {
    narrative += ` with ${moveName}`;
  } else {
    narrative += ` with a measured ${moveName}`;
  }
  
  // Add intent alignment commentary
  if (moveScore.intentAlignment >= 8) {
    narrative += ` - perfectly aligned with their tactical goal`;
  } else if (moveScore.intentAlignment >= 6) {
    narrative += ` - well-suited to their current strategy`;
  } else if (moveScore.intentAlignment <= 3) {
    narrative += ` - a deviation from their intended approach`;
  }
  
  return narrative;
}

/**
 * @description Gets a summary of the current AI state for debugging and analysis.
 * @param {AdvancedAIState} state - The AI state to summarize.
 * @returns {string} A human-readable summary of the AI state.
 */
export function getAIStateSummary(state: AdvancedAIState): string {
  const { context, intent, intentTurnCount } = state;
  
  return `
AI State Summary:
- Intent: ${intent.type} (${intent.description})
- Intent Duration: ${intentTurnCount} turns
- Health: ${context.myHealth} vs ${context.enemyHealth}
- Momentum: ${context.hasMomentum ? 'Yes' : 'No'}
- Enemy Pattern: ${context.enemyPattern}
- Game Phase: ${context.isEarlyGame ? 'Early' : context.isMidGame ? 'Mid' : 'Late'}
- Burst Available: ${context.burstAvailable ? 'Yes' : 'No'}
- Enemy Threat: ${context.enemyBurstThreat ? 'Yes' : 'No'}
- Chi Pressure: ${context.chiPressure ? 'Yes' : 'No'}
- Health Pressure: ${context.healthPressure ? 'Yes' : 'No'}
  `.trim();
}

/**
 * Computes the AI's tendency to attempt a reversal based on character, state, and risk/reward.
 * Returns a weight (0-1) for reversal likelihood.
 */
export function getReversalWeight(character: BattleCharacter): number {
  let weight = 0;
  if (character.controlState === 'Compromised' && character.stability < 20) {
    if (character.name === 'Aang') {
      weight += 0.4; // Aang is more likely to attempt a reversal when desperate
    } else if (character.name === 'Azula') {
      weight += 0.3; // Azula is aggressive, but less likely than Aang for a true reversal
    } else {
      weight += 0.2; // Default for other characters
    }
  }
  // TODO: Add more nuanced logic for behavioralTraits, location, etc.
  return weight;
} 