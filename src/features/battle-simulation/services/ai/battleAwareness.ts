// CONTEXT: Battle Awareness and Context Analysis
// RESPONSIBILITY: Analyze battle state to provide situational awareness for AI decision making
import { BattleCharacter, BattleLogEntry } from '../../types';

/**
 * @description Comprehensive battle context that captures the current tactical situation.
 */
export interface BattleContext {
  // Current state metrics
  myHealth: number;
  myDefense: number;
  myChi: number;
  enemyHealth: number;
  enemyDefense: number;
  enemyChi: number;
  
  // Recent move history
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
}

/**
 * @description Analyzes the battle context to provide situational awareness.
 * @param {BattleCharacter} me - The AI character making the decision.
 * @param {BattleCharacter} enemy - The enemy character.
 * @param {BattleLogEntry[]} log - The battle log entries.
 * @returns {BattleContext} The computed battle context.
 */
export function getBattleContext(
  me: BattleCharacter,
  enemy: BattleCharacter,
  log: BattleLogEntry[]
): BattleContext {
  // Look back at the last 6 turns (3 for each participant)
  const recent = log.slice(-6);
  
  // Get last moves
  const lastMyMove = me.moveHistory[me.moveHistory.length - 1];
  const lastEnemyMove = enemy.moveHistory[enemy.moveHistory.length - 1];
  
  // Calculate streaks
  const enemyDefenseStreak = countConsecutive(enemy.moveHistory, ['defend', 'defense_buff']);
  const myAttackStreak = countConsecutive(me.moveHistory, ['attack']);
  
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
    .filter(entry => entry.actor === me.name && entry.damage)
    .reduce((sum, entry) => sum + (entry.damage || 0), 0);
    
  const enemyRecentDamage = recent
    .filter(entry => entry.actor === enemy.name && entry.damage)
    .reduce((sum, entry) => sum + (entry.damage || 0), 0);
  
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
  const enemyPattern = analyzePattern(enemy.moveHistory);
  const myPattern = analyzePattern(me.moveHistory);
  
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
 * @param {string[]} moves - The move history to analyze.
 * @param {string[]} tags - The tags to look for.
 * @returns {number} The count of consecutive matching moves.
 */
function countConsecutive(moves: string[], tags: string[]): number {
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
 * @param {string[]} moveHistory - The move history to analyze.
 * @returns {'aggressive' | 'defensive' | 'mixed' | 'unknown'} The detected pattern.
 */
function analyzePattern(moveHistory: string[]): 'aggressive' | 'defensive' | 'mixed' | 'unknown' {
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