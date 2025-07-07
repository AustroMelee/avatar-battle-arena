// @file battleStateAwareness.ts
// @description Provides tactical context and perceived battle state for AI decision making, including pattern recognition and context extraction.
// @criticality 🧠 AI Context (High) | Depends on: types, battle log
// @owner AustroMelee
// @lastUpdated 2025-07-07
// @related types, battle log
//
// All exports are documented below.
// CONTEXT: Battle State Awareness
// RESPONSIBILITY: Provide complete tactical context for AI decision making
import { BattleCharacter, BattleLogEntry } from '../../types';

/**
 * @description Complete snapshot of battle state as perceived by an AI agent.
 * @exports PerceivedBattleState
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
 * Provides all necessary information for tactical reasoning and decision making.
 */
export type PerceivedBattleState = {
  turn: number;
  self: {
    name: string;
    currentHealth: number;
    maxHealth: number;
    currentDefense: number;
    resources: { chi: number };
    buffs: string[];
    debuffs: string[];
    cooldowns: Record<string, number>;
    lastMove: string | null;
    moveHistory: string[];
  };
  enemy: {
    name: string;
    currentHealth: number;
    maxHealth: number;
    currentDefense: number;
    resources: { chi: number };
    buffs: string[];
    debuffs: string[];
    cooldowns: Record<string, number>;
    lastMove: string | null;
    moveHistory: string[];
  };
  battleLog: BattleLogEntry[];
};

/**
 * @description Enhanced battle context with tactical insights and pattern recognition.
 * @exports BattleTacticalContext
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
 */
export type BattleTacticalContext = {
  // Core state metrics
  myHealth: number;
  myDefense: number;
  myChi: number;
  enemyHealth: number;
  enemyDefense: number;
  enemyChi: number;
  
  // Recent move history analysis
  lastMyMove?: string;
  lastEnemyMove?: string;
  enemyDefenseStreak: number;
  myAttackStreak: number;
  
  // Tactical assessments
  isLosing: boolean;
  isDominating: boolean;
  enemyIsTurtling: boolean;
  enemyVulnerable: boolean;
  hasMomentum: boolean;
  
  // Resource and threat analysis
  burstAvailable: boolean;
  enemyBurstThreat: boolean;
  chiPressure: boolean;
  healthPressure: boolean;
  
  // Pattern recognition
  enemyPattern: 'aggressive' | 'defensive' | 'mixed' | 'unknown';
  myPattern: 'aggressive' | 'defensive' | 'mixed' | 'unknown';
  
  // Turn-based insights
  turnCount: number;
  isEarlyGame: boolean;
  isMidGame: boolean;
  isLateGame: boolean;
  
  // Damage analysis
  myRecentDamage: number;
  enemyRecentDamage: number;
  damageRatio: number;
  
  // Cooldown analysis
  myCooldownPressure: boolean;
  enemyCooldownPressure: boolean;
};

/**
 * @description Generates a complete perceived battle state for AI decision making.
 * @function getPerceivedBattleState
 * @param {number} turn - Current turn number
 * @param {BattleCharacter} self - The AI character making the decision
 * @param {BattleCharacter} enemy - The enemy character
 * @param {BattleLogEntry[]} battleLog - Full battle log for context
 * @returns {PerceivedBattleState} Complete battle state snapshot
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
 */
export function getPerceivedBattleState(
  turn: number,
  self: BattleCharacter,
  enemy: BattleCharacter,
  battleLog: BattleLogEntry[]
): PerceivedBattleState {
  return {
    turn,
      self: {
    name: self.name,
    currentHealth: self.currentHealth,
    maxHealth: 100, // All characters start with 100 health
    currentDefense: self.currentDefense,
    resources: { ...self.resources },
    buffs: self.activeEffects.filter(e => e.category === 'buff').map(e => e.name),
    debuffs: self.activeEffects.filter(e => e.category === 'debuff').map(e => e.name),
    cooldowns: { ...self.cooldowns },
    lastMove: self.lastMove || null,
    moveHistory: [...self.moveHistory]
  },
  enemy: {
    name: enemy.name,
    currentHealth: enemy.currentHealth,
    maxHealth: 100, // All characters start with 100 health
    currentDefense: enemy.currentDefense,
    resources: { ...enemy.resources },
    buffs: enemy.activeEffects.filter(e => e.category === 'buff').map(e => e.name),
    debuffs: enemy.activeEffects.filter(e => e.category === 'debuff').map(e => e.name),
    cooldowns: { ...enemy.cooldowns },
    lastMove: enemy.lastMove || null,
    moveHistory: [...enemy.moveHistory]
  },
    battleLog: battleLog.slice(-10) // Last 10 entries for context
  };
}

/**
 * @description Analyzes battle context to provide tactical insights for AI decision making.
 * @function getBattleTacticalContext
 * @param {BattleCharacter} me - The AI character making the decision
 * @param {BattleCharacter} enemy - The enemy character
 * @param {BattleLogEntry[]} log - The battle log entries
 * @returns {BattleTacticalContext} Comprehensive tactical context
 * @owner AustroMelee
 * @lastUpdated 2025-07-07
 */
export function getBattleTacticalContext(
  me: BattleCharacter,
  enemy: BattleCharacter,
  log: BattleLogEntry[]
): BattleTacticalContext {
  // Look back at the last 6 turns (3 for each participant)
  const recent = log.slice(-6);
  
  // Get last moves
  const lastMyMove = me.moveHistory[me.moveHistory.length - 1];
  const lastEnemyMove = enemy.moveHistory[enemy.moveHistory.length - 1];
  
  // Calculate streaks
  const enemyDefenseStreak = countConsecutiveMoves(enemy.moveHistory, ['defend', 'defense_buff']);
  const myAttackStreak = countConsecutiveMoves(me.moveHistory, ['attack']);
  
  // Analyze burst availability
  const burstAvailable = me.abilities.some(ability => 
    ability.baseDamage > 40 && 
    (!me.cooldowns[ability.name] || me.cooldowns[ability.name] === 0) && 
    (me.resources.chi || 0) >= (ability.chiCost || 0)
  );
  
  const enemyBurstThreat = enemy.abilities.some(ability => 
    ability.baseDamage > 40 && 
    (!enemy.cooldowns[ability.name] || enemy.cooldowns[ability.name] === 0) && 
    (enemy.resources.chi || 0) >= (ability.chiCost || 0)
  );
  
  // Calculate recent damage
  const myRecentDamage = recent
    .filter(entry => entry.actor === me.name && entry.details?.damage)
    .reduce((sum, entry) => sum + (entry.details?.damage || 0), 0);
    
  const enemyRecentDamage = recent
    .filter(entry => entry.actor === enemy.name && entry.details?.damage)
    .reduce((sum, entry) => sum + (entry.details?.damage || 0), 0);
  
  const damageRatio = enemyRecentDamage > 0 ? myRecentDamage / enemyRecentDamage : 1;
  
  // Determine momentum
  const hasMomentum = myRecentDamage > enemyRecentDamage + 2;
  
  // Health and resource pressure
  const healthPressure = me.currentHealth < 30;
  const chiPressure = (me.resources.chi || 0) < 2;
  
  // Cooldown pressure analysis
  const myCooldownPressure = Object.values(me.cooldowns).some(cooldown => cooldown > 0);
  const enemyCooldownPressure = Object.values(enemy.cooldowns).some(cooldown => cooldown > 0);
  
  // Game phase analysis
  const turnCount = log.length;
  const isEarlyGame = turnCount <= 4;
  const isMidGame = turnCount > 4 && turnCount <= 12;
  const isLateGame = turnCount > 12;
  
  // Pattern recognition
  const enemyPattern = analyzeMovePattern(enemy.moveHistory);
  const myPattern = analyzeMovePattern(me.moveHistory);
  
  // Win/loss assessment
  const isLosing = me.currentHealth < enemy.currentHealth - 10;
  const isDominating = me.currentHealth > enemy.currentHealth + 10;
  
  return {
    myHealth: me.currentHealth,
    myDefense: me.currentDefense,
    myChi: me.resources.chi || 0,
    enemyHealth: enemy.currentHealth,
    enemyDefense: enemy.currentDefense,
    enemyChi: enemy.resources.chi || 0,
    lastMyMove,
    lastEnemyMove,
    enemyDefenseStreak,
    myAttackStreak,
    isLosing,
    isDominating,
    enemyIsTurtling: enemyDefenseStreak >= 3,
    enemyVulnerable: enemy.currentDefense < 10,
    hasMomentum,
    burstAvailable,
    enemyBurstThreat,
    chiPressure,
    healthPressure,
    enemyPattern,
    myPattern,
    turnCount,
    isEarlyGame,
    isMidGame,
    isLateGame,
    myRecentDamage,
    enemyRecentDamage,
    damageRatio,
    myCooldownPressure,
    enemyCooldownPressure
  };
}

/**
 * @description Counts consecutive moves that match specific tags.
 * @param {string[]} moves - The move history to analyze
 * @param {string[]} tags - The tags to look for
 * @returns {number} The count of consecutive matching moves
 */
function countConsecutiveMoves(moves: string[], tags: string[]): number {
  let count = 0;
  for (let i = moves.length - 1; i >= 0; i--) {
    if (tags.some(tag => moves[i]?.toLowerCase().includes(tag))) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/**
 * @description Analyzes the pattern of moves in a character's history.
 * @param {string[]} moveHistory - The move history to analyze
 * @returns {'aggressive' | 'defensive' | 'mixed' | 'unknown'} The detected pattern
 */
function analyzeMovePattern(moveHistory: string[]): 'aggressive' | 'defensive' | 'mixed' | 'unknown' {
  if (moveHistory.length === 0) return 'unknown';
  
  const recent = moveHistory.slice(-5); // Look at last 5 moves
  const attackCount = recent.filter(move => 
    move.toLowerCase().includes('attack')
  ).length;
  
  const defenseCount = recent.filter(move => 
    move.toLowerCase().includes('defend') || move.toLowerCase().includes('defense')
  ).length;
  
  if (attackCount > defenseCount + 1) return 'aggressive';
  if (defenseCount > attackCount + 1) return 'defensive';
  return 'mixed';
} 