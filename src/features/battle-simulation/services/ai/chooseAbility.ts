// CONTEXT: AI Ability Selection
// RESPONSIBILITY: Choose abilities with comprehensive logging
import { Ability } from '@/common/types';
import { BattleCharacter, AILogEntry, PerceivedState, ConsideredAction, BattleLogEntry } from '../../types';
import { assessMetaState } from './metaState';
import { getAvailableMoves } from '../utils/moveUtils';
import { scoreMoves } from './moveScoring';
import { selectMove } from './moveSelection';
import { buildMoveNarrative } from './narrative';
import { chooseAbilityWithAdvancedAI, AdvancedAIState } from './advancedAIController';
import { getPerceivedBattleState, getBattleTacticalContext } from './battleStateAwareness';
import { selectBestTacticalMove } from './enhancedMoveScoring';
import { createTacticalLogEntry } from './tacticalNarrative';

/**
 * @description Creates a perceived state for AI decision making.
 * @param {BattleCharacter} self - The AI character making the decision.
 * @param {BattleCharacter} enemy - The enemy character.
 * @param {number} turn - Current turn number.
 * @returns {PerceivedState} The perceived state for AI analysis.
 */
function createPerceivedState(self: BattleCharacter, enemy: BattleCharacter, turn: number): PerceivedState {
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
      activeBuffs: self.activeBuffs,
      activeDebuffs: self.activeDebuffs,
      resources: self.resources
    },
    enemy: {
      health: enemy.currentHealth,
      defense: enemy.currentDefense,
      personality: enemy.personality,
      name: enemy.name,
      lastMove: enemy.lastMove,
      moveHistory: enemy.moveHistory,
      activeBuffs: enemy.activeBuffs,
      activeDebuffs: enemy.activeDebuffs
    },
    round: turn,
    cooldowns: {} // Legacy field - can be removed after migration
  };
}

/**
 * @description Chooses an ability for a character with comprehensive AI logging.
 * @param {BattleCharacter} character - The character choosing the ability.
 * @param {BattleCharacter} enemy - The enemy character.
 * @param {number} turn - Current turn number.
 * @param {BattleLogEntry[]} battleLog - The battle log entries.
 * @param {AdvancedAIState | null} previousState - The previous AI state (for intent continuity).
 * @returns {{ability: Ability; aiLog: AILogEntry; newState: AdvancedAIState}} The chosen ability, AI log, and new state.
 */
export function chooseAbilityWithLogging(
  character: BattleCharacter, 
  enemy: BattleCharacter, 
  turn: number,
  battleLog: BattleLogEntry[] = [],
  previousState: AdvancedAIState | null = null
): { ability: Ability; aiLog: AILogEntry; newState: AdvancedAIState } {
  // Get complete battle state awareness
  const perceivedBattleState = getPerceivedBattleState(turn, character, enemy, battleLog);
  const tacticalContext = getBattleTacticalContext(character, enemy, battleLog);
  
  // Use the enhanced tactical system for better decision making
  const meta = assessMetaState(character, enemy, turn);
  const availableAbilities = getAvailableMoves(character, meta);
  
  // Use enhanced tactical move selection
  const tacticalResult = selectBestTacticalMove(availableAbilities, character, enemy);
  
  // Use the advanced AI system if we have battle log data (fallback)
  if (battleLog.length > 0 && Math.random() < 0.3) { // 30% chance to use advanced AI
    return chooseAbilityWithAdvancedAI(character, enemy, turn, battleLog, previousState);
  }
  
  // Use enhanced tactical system as primary
  const selected = {
    move: tacticalResult.chosenAbility,
    reasons: tacticalResult.reasons,
    score: tacticalResult.score
  };
  
  // 5. Build AI log with enhanced battle state awareness
  const perceivedState = createPerceivedState(character, enemy, turn);
  const consideredActions: ConsideredAction[] = [{
    move: selected.move.name,
    score: Math.round(selected.score * 100) / 100,
    reason: selected.reasons.join(' - '),
    abilityId: selected.move.name.toLowerCase().replace(/\s+/g, '_')
  }];
  
  const aiLog: AILogEntry = {
    turn,
    agent: character.name,
    perceivedState,
    consideredActions,
    chosenAction: selected.move.name,
    reasoning: selected.reasons.join(' - '),
    narrative: `${character.name} uses ${selected.move.name} - ${tacticalResult.tacticalExplanation}`,
    timestamp: Date.now()
  };
  
  // Create enhanced AI state with battle awareness
  const newState: AdvancedAIState = {
    context: {
      myHealth: tacticalContext.myHealth,
      myDefense: tacticalContext.myDefense,
      myChi: tacticalContext.myChi,
      enemyHealth: tacticalContext.enemyHealth,
      enemyDefense: tacticalContext.enemyDefense,
      enemyChi: tacticalContext.enemyChi,
      lastMyMove: tacticalContext.lastMyMove,
      lastEnemyMove: tacticalContext.lastEnemyMove,
      enemyDefenseStreak: tacticalContext.enemyDefenseStreak,
      myAttackStreak: tacticalContext.myAttackStreak,
      isLosing: tacticalContext.isLosing,
      isDominating: tacticalContext.isDominating,
      enemyIsTurtling: tacticalContext.enemyIsTurtling,
      enemyVulnerable: tacticalContext.enemyVulnerable,
      hasMomentum: tacticalContext.hasMomentum,
      burstAvailable: tacticalContext.burstAvailable,
      enemyBurstThreat: tacticalContext.enemyBurstThreat,
      chiPressure: tacticalContext.chiPressure,
      healthPressure: tacticalContext.healthPressure,
      enemyPattern: tacticalContext.enemyPattern,
      myPattern: tacticalContext.myPattern,
      turnCount: tacticalContext.turnCount,
      isEarlyGame: tacticalContext.isEarlyGame,
      isMidGame: tacticalContext.isMidGame,
      isLateGame: tacticalContext.isLateGame,
      myRecentDamage: tacticalContext.myRecentDamage,
      enemyRecentDamage: tacticalContext.enemyRecentDamage,
      damageRatio: tacticalContext.damageRatio,
      myCooldownPressure: tacticalContext.myCooldownPressure,
      enemyCooldownPressure: tacticalContext.enemyCooldownPressure
    },
    intent: {
      type: 'standard_attack',
      description: 'Legacy fallback - standard attacks',
      priority: 3,
      expectedDuration: 1
    },
    intentTurnCount: 1,
    lastIntentChange: turn
  };
  
  return { ability: selected.move, aiLog, newState };
} 