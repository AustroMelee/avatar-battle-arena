// Used via dynamic registry in AI engine. See SYSTEM ARCHITECTURE.MD for flow.
// @docs
// @description: Main AI controller for Avatar Battle Arena. All AI orchestration is registry/data-driven and plug-and-play. No hard-coded content. Extensible via data/registries only. SRP-compliant. See SYSTEM ARCHITECTURE.MD for integration points.
// @criticality: 🧠 AI
// @owner: AustroMelee
// @tags: ai, controller, SRP, registry, plug-and-play, extensibility
//
// This file should never reference character, move, or narrative content directly. All extensibility is via data/registries.
//
// Updated for 2025 registry-driven architecture overhaul.
//
// All exports are documented below.
// CONTEXT: Advanced AI Controller
// RESPONSIBILITY: Integrate battle awareness, intent system, and contextual move scoring
import { Location } from '@/common/types';
import { BattleCharacter, AILogEntry, BattleLogEntry } from '../../types';
import type { Move } from '../../types/move.types';
import type { BattleState } from '../../types';
import type { BattleTacticalContext } from './battleStateAwareness';
import type { Intent } from './intentSystem';
import { getBattleTacticalContext } from './battleStateAwareness';
import { chooseIntent, shouldMaintainIntent } from './intentSystem';
import { scoreMovesWithContext } from './contextualMoveScoring';
import { getAvailableMoves } from './moveUtils';
import { assessMetaState } from './metaState';
import { isMoveStale, isBasicMove } from './moveSelection';

/**
 * @description Enhanced AI decision state that includes context and intent.
 * @exports AdvancedAIState
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
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
// function _createEnhancedPerceivedState(
//   self: BattleCharacter, 
//   enemy: BattleCharacter, 
//   turn: number
// ): PerceivedState {
//   // TODO: Replace placeholder values with real character state logic
//   return {
//     self: {
//       health: self.currentHealth,
//       defense: self.currentDefense,
//       personality: self.base.personality,
//       abilities: self.abilities.map(move => ({
//         id: move.id,
//         name: move.name,
//         type: move.type,
//         power: move.baseDamage,
//         cooldown: move.cooldown
//       })),
//       cooldowns: self.cooldowns,
//       lastMove: self.lastMove,
//       moveHistory: self.moveHistory,
//       activeEffects: self.activeEffects,
//       resources: self.resources,
//       position: self.position ?? { x: 0, y: 0 },
//       isCharging: self.isCharging ?? false,
//       chargeProgress: self.chargeProgress ?? 0,
//       repositionAttempts: self.repositionAttempts ?? 0
//     },
//     enemy: {
//       health: enemy.currentHealth,
//       defense: enemy.currentDefense,
//       personality: enemy.base.personality,
//       name: enemy.name,
//       lastMove: enemy.lastMove,
//       moveHistory: enemy.moveHistory,
//       activeEffects: enemy.activeEffects,
//       position: enemy.position ?? { x: 0, y: 0 },
//       isCharging: enemy.isCharging ?? false,
//       chargeProgress: enemy.chargeProgress ?? 0,
//       repositionAttempts: enemy.repositionAttempts ?? 0
//     },
//     round: turn,
//     cooldowns: {}, // Legacy field - can be removed after migration
//     location: 'Fire Nation Throne Hall', // TODO: Replace with real location
//     locationType: 'Enclosed'
//   };
// }

/**
 * Modern AI move selection with strict phase-based escalation/desperation logic.
 * - Only uses battleState.tacticalPhase for escalation/desperation awareness.
 * - In 'desperation' phase: restricts to desperation/finisher moves, prefers finishers.
 * - In 'escalation' phase: restricts to escalation/aggressive moves.
 * - Robust fallback: struggle/pass/null if no legal moves.
 * - No flag checks or legacy escalation detection.
 */
export function selectAIMove({
  availableMoves,
  battleState,
  context,
  intent,
  intentTurnCount,
  turn
}: {
  availableMoves: Move[];
  battleState: BattleState;
  context: BattleTacticalContext;
  intent: Intent;
  intentTurnCount: number;
  turn: number;
}) {
  // Phase-based move restriction
  const isDesperationPhase = battleState.tacticalPhase === 'desperation';
  const isEscalationPhase = battleState.tacticalPhase === 'escalation';

  let filteredMoves = availableMoves;

  if (isDesperationPhase) {
    // Only allow desperation-tagged moves and finishers
    const desperationMoves = filteredMoves.filter(
      m => m.tags?.includes('desperation') || m.tags?.includes('finisher')
    );
    if (desperationMoves.length > 0) {
      filteredMoves = desperationMoves;
      // Prefer finishers if available
      const finisher = filteredMoves.find(m => m.tags?.includes('finisher'));
      if (finisher) {
        return { move: finisher, aiLog: null, newState: { context, intent, intentTurnCount, lastIntentChange: turn } };
      }
      // Otherwise, pick the highest-risk desperation move (fallback to baseDamage)
      const highestRisk = filteredMoves.reduce((best, current) =>
        (current.baseDamage > best.baseDamage) ? current : best
      );
      return { move: highestRisk, aiLog: null, newState: { context, intent, intentTurnCount, lastIntentChange: turn } };
    } else {
      // No legal moves: fallback
      return { move: null, aiLog: null, newState: { context, intent, intentTurnCount, lastIntentChange: turn } };
    }
  } else if (isEscalationPhase) {
    // Only allow escalation-tagged moves or aggressive (non-basic) moves
    const escalationMoves = filteredMoves.filter(
      m => m.tags?.includes('escalation') || !isBasicMove(m)
    );
    if (escalationMoves.length > 0) {
      filteredMoves = escalationMoves;
    } else {
      // No legal moves: fallback
      return { move: null, aiLog: null, newState: { context, intent, intentTurnCount, lastIntentChange: turn } };
    }
  }

  // Default: use move scoring/intent logic (not shown here)
  // ... existing scoring/selection logic ...
  // For now, just pick the best scored move
  const bestMove = filteredMoves[0] || null;
  return { move: bestMove, aiLog: null, newState: { context, intent, intentTurnCount, lastIntentChange: turn } };
}

/**
 * @description Chooses a move using the advanced AI system with context awareness and tactical intent.
 * @function chooseMoveWithAdvancedAI
 * @param {BattleCharacter} character - The character choosing the move.
 * @param {BattleCharacter} enemy - The enemy character.
 * @param {number} turn - Current turn number.
 * @param {BattleLogEntry[]} battleLog - The battle log entries.
 * @param {Location} location - The battle location for collateral damage checks.
 * @param {AdvancedAIState | null} previousState - The previous AI state (for intent continuity).
 * @returns {{move: Move; aiLog: AILogEntry; newState: AdvancedAIState}} The chosen move, AI log, and new state.
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
 */
export function chooseMoveWithAdvancedAI(
  character: BattleCharacter, 
  enemy: BattleCharacter, 
  turn: number,
  battleLog: BattleLogEntry[],
  location: Location,
  previousState: AdvancedAIState | null = null
): { move: Move | null; aiLog: AILogEntry | null; newState: AdvancedAIState } {
  
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
  let availableMoves = getAvailableMoves(character, meta, location, turn, 0);
  const inEscalation = character.flags?.forcedEscalation === 'true' || character.flags?.desperationState;
  if (inEscalation) {
    const nonBasicMoves = availableMoves.filter(move => !isBasicMove(move));
    if (nonBasicMoves.length > 0) {
      availableMoves = nonBasicMoves;
    } else {
      // No non-basic moves left: escalate immediately
      return { move: null, aiLog: null, newState: { context, intent, intentTurnCount, lastIntentChange: turn } };
    }
  } else {
    const nonStaleMoves = availableMoves.filter(move => !isMoveStale(move.id, character.moveHistory));
    if (nonStaleMoves.length > 0) {
      availableMoves = nonStaleMoves;
    }
  }
  if (availableMoves.length === 0) {
    return { move: null, aiLog: null, newState: { context, intent, intentTurnCount, lastIntentChange: turn } };
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
  
  return { move: bestMove.move, aiLog, newState };
}

/**
 * @description Builds an advanced narrative for the chosen move incorporating context and intent.
 * @param {BattleCharacter} character - The character making the move.
 * @param {Move} move - The chosen move.
 * @param {BattleTacticalContext} context - The battle context.
 * @param {Intent} intent - The tactical intent.
 * @param {ContextualMoveScore} moveScore - The move score details.
 * @returns {string} The narrative description.
 */
// function _buildAdvancedMoveNarrative(
//   character: BattleCharacter,
//   move: Move,
//   context: BattleTacticalContext,
//   intent: Intent,
//   moveScore: ContextualMoveScore
// ): string {
//   const characterName = character.name;
//   const moveName = move.name;
//   const intentType = intent.type;
//   
//   // Base narrative based on intent
//   let narrative = `${characterName} follows their ${intentType.replace('_', ' ')} strategy`;
//   
//   // Add context-specific details
//   if (context.enemyVulnerable && (move.type === 'attack' || move.type === 'parry_retaliate')) {
//     narrative += `, seizing the opportunity while ${context.enemyHealth < 20 ? 'the enemy is critically wounded' : 'the enemy is vulnerable'}`;
//   }
//   
//   if (context.healthPressure && (move.type === 'defense_buff' || move.type === 'evade')) {
//     narrative += `, desperately trying to survive with ${character.currentHealth} health remaining`;
//   }
//   
//   if (context.enemyIsTurtling && (move.type === 'attack' || move.type === 'parry_retaliate')) {
//     narrative += `, attempting to break through the enemy's defensive stance`;
//   }
//   
//   if (context.hasMomentum && (move.type === 'attack' || move.type === 'parry_retaliate')) {
//     narrative += `, building on their momentum`;
//   }
//   
//   if (context.chiPressure && (move.chiCost || 0) === 0) {
//     narrative += `, conserving their dwindling chi reserves`;
//   }
//   
//   // Add move-specific details
//   if (move.baseDamage > 40) {
//     narrative += ` with a powerful ${moveName}`;
//   } else if (move.baseDamage > 20) {
//     narrative += ` with ${moveName}`;
//   } else {
//     narrative += ` with a measured ${moveName}`;
//   }
//   
//   // Add intent alignment commentary
//   if (moveScore.intentAlignment >= 8) {
//     narrative += ` - perfectly aligned with their tactical goal`;
//   } else if (moveScore.intentAlignment >= 6) {
//     narrative += `