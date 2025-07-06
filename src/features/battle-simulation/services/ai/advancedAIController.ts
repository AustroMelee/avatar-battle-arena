// CONTEXT: Advanced AI Controller
// RESPONSIBILITY: Integrate battle awareness, intent system, and contextual move scoring
import { Ability } from '@/common/types';
import { BattleCharacter, AILogEntry, PerceivedState, ConsideredAction, BattleLogEntry } from '../../types';
import { getBattleTacticalContext, BattleTacticalContext } from './battleStateAwareness';
import { chooseIntent, Intent, shouldMaintainIntent } from './intentSystem';
import { scoreMovesWithContext, ContextualMoveScore } from './contextualMoveScoring';
import { getAvailableMoves } from '../utils/moveUtils';
import { assessMetaState } from './metaState';
// Removed unused import

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
    locationType: 'interior' as any // TODO: Replace with real locationType
  };
}

/**
 * @description Chooses an ability using the advanced AI system with context awareness and tactical intent.
 * @param {BattleCharacter} character - The character choosing the ability.
 * @param {BattleCharacter} enemy - The enemy character.
 * @param {number} turn - Current turn number.
 * @param {BattleLogEntry[]} battleLog - The battle log entries.
 * @param {AdvancedAIState | null} previousState - The previous AI state (for intent continuity).
 * @returns {{ability: Ability; aiLog: AILogEntry; newState: AdvancedAIState}} The chosen ability, AI log, and new state.
 */
export function chooseAbilityWithAdvancedAI(
  character: BattleCharacter, 
  enemy: BattleCharacter, 
  turn: number,
  battleLog: BattleLogEntry[],
  previousState: AdvancedAIState | null = null
): { ability: Ability; aiLog: AILogEntry; newState: AdvancedAIState } {
  

  
  // 1. Analyze battle context
  const context = getBattleTacticalContext(character, enemy, battleLog);
  
  // 2. Determine tactical intent
  let intent: Intent;
  let intentTurnCount: number;
  
  if (previousState && shouldMaintainIntent(previousState.intent, context)) {
    // Maintain current intent
    intent = previousState.intent;
    intentTurnCount = previousState.intentTurnCount + 1;
  } else {
    // Choose new intent
    intent = chooseIntent(context);
    intentTurnCount = 1;
  }
  
  // 3. Get available moves
  const meta = assessMetaState(character, enemy, turn);
  const availableMoves = getAvailableMoves(character, meta);
  
  // 4. Score moves with context and intent
  const contextualMoveScores = scoreMovesWithContext(
    availableMoves, 
    character, 
    enemy, 
    context, 
    intent
  );
  
  // 5. Select move with variance (weighted random from top 3)
  const topMoves = contextualMoveScores.slice(0, 3);
  const totalWeight = topMoves.reduce((sum, _move, index) => sum + (3 - index), 0);
  const random = Math.random() * totalWeight;
  
  let cumulativeWeight = 0;
  let selected = topMoves[0]; // Fallback
  
  for (let i = 0; i < topMoves.length; i++) {
    cumulativeWeight += (3 - i);
    if (random <= cumulativeWeight) {
      selected = topMoves[i];
      break;
    }
  }
  

  
  // 6. Build enhanced AI log
  const perceivedState = createEnhancedPerceivedState(character, enemy, turn);
  const consideredActions: ConsideredAction[] = contextualMoveScores.slice(0, 5).map(({ move, score, reasons, contextFactors, intentAlignment }) => ({
    move: move.name,
    score: Math.round(score * 100) / 100,
    reason: `${reasons.join(' - ')} [Intent: ${intentAlignment}/10] [Context: ${contextFactors.join(', ')}]`,
    abilityId: move.name.toLowerCase().replace(/\s+/g, '_')
  }));
  
  const aiLog: AILogEntry = {
    turn,
    agent: character.name,
    perceivedState,
    consideredActions,
    chosenAction: selected.move.name,
    reasoning: `Intent: ${intent.type} (${intent.description}) - ${selected.reasons.join(' - ')}`,
    narrative: buildAdvancedMoveNarrative(character, selected.move, context, intent, selected),
    timestamp: Date.now()
  };
  
  // 7. Create new AI state
  const newState: AdvancedAIState = {
    context,
    intent,
    intentTurnCount,
    lastIntentChange: intentTurnCount === 1 ? turn : (previousState?.lastIntentChange || turn)
  };
  
  return { ability: selected.move, aiLog, newState };
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