// CONTEXT: Battle State Awareness Example
// RESPONSIBILITY: Demonstrate how to use the battle state awareness system
import { getPerceivedBattleState, getBattleTacticalContext } from './battleStateAwareness';
import { BattleCharacter, BattleLogEntry } from '../../types';
import { Character } from '@/common/types';

/**
 * @description Example of how to integrate battle state awareness into AI decision making.
 */
export function demonstrateBattleStateAwareness(): void {
  console.log('=== Battle State Awareness Example ===\n');

  // Create example characters
  const aang: BattleCharacter = {
    id: 'aang',
    name: 'Aang',
    image: '/assets/aang.jpg',
    bending: 'air',
    stats: { power: 60, agility: 80, defense: 40, intelligence: 70 },
    abilities: [
      { name: 'Air Slice', type: 'attack', power: 35, description: 'Swift air attack', chiCost: 2 },
      { name: 'Air Shield', type: 'defense_buff', power: 25, description: 'Defensive air barrier', chiCost: 1 }
    ],
    personality: 'balanced',
    currentHealth: 65,
    currentDefense: 15,
    cooldowns: { 'Air Slice': 1 },
    moveHistory: ['Air Slice', 'Air Shield', 'Air Slice'],
    lastMove: 'Air Slice',
    resources: { chi: 6 },
    activeBuffs: [{ id: 'shield', name: 'Air Shield', duration: 2, description: 'Defense buff', source: 'Air Shield' }],
    activeDebuffs: []
  };

  const zuko: BattleCharacter = {
    id: 'zuko',
    name: 'Zuko',
    image: '/assets/zuko.jpg',
    bending: 'fire',
    stats: { power: 70, agility: 60, defense: 50, intelligence: 60 },
    abilities: [
      { name: 'Fire Blast', type: 'attack', power: 40, description: 'Powerful fire attack', chiCost: 3 },
      { name: 'Defense Stance', type: 'defense_buff', power: 30, description: 'Defensive stance', chiCost: 1 }
    ],
    personality: 'aggressive',
    currentHealth: 80,
    currentDefense: 30,
    cooldowns: {},
    moveHistory: ['Fire Blast', 'Defense Stance', 'Defense Stance'],
    lastMove: 'Defense Stance',
    resources: { chi: 4 },
    activeBuffs: [{ id: 'stance', name: 'Defense Stance', duration: 1, description: 'Defense buff', source: 'Defense Stance' }],
    activeDebuffs: []
  };

  // Create example battle log
  const battleLog: BattleLogEntry[] = [
    {
      turn: 1,
      actor: 'Aang',
      action: 'Air Slice',
      target: 'Zuko',
      result: 'Dealt 20 damage',
      damage: 20,
      abilityType: 'attack',
      timestamp: Date.now() - 3000
    },
    {
      turn: 2,
      actor: 'Zuko',
      action: 'Fire Blast',
      target: 'Aang',
      result: 'Dealt 25 damage',
      damage: 25,
      abilityType: 'attack',
      timestamp: Date.now() - 2000
    },
    {
      turn: 3,
      actor: 'Aang',
      action: 'Air Shield',
      target: 'Self',
      result: 'Increased defense by 25',
      abilityType: 'defense_buff',
      timestamp: Date.now() - 1000
    },
    {
      turn: 4,
      actor: 'Zuko',
      action: 'Defense Stance',
      target: 'Self',
      result: 'Increased defense by 30',
      abilityType: 'defense_buff',
      timestamp: Date.now() - 500
    }
  ];

  const currentTurn = 5;

  // Get complete battle state awareness
  console.log('1. Getting Perceived Battle State...');
  const perceivedState = getPerceivedBattleState(currentTurn, aang, zuko, battleLog);
  
  console.log('Aang\'s State:');
  console.log(`  Health: ${perceivedState.self.currentHealth}/${perceivedState.self.maxHealth}`);
  console.log(`  Defense: ${perceivedState.self.currentDefense}`);
  console.log(`  Chi: ${perceivedState.self.resources.chi}`);
  console.log(`  Buffs: ${perceivedState.self.buffs.join(', ') || 'None'}`);
  console.log(`  Cooldowns: ${Object.keys(perceivedState.self.cooldowns).join(', ') || 'None'}`);
  console.log(`  Last Move: ${perceivedState.self.lastMove}`);
  
  console.log('\nZuko\'s State:');
  console.log(`  Health: ${perceivedState.enemy.currentHealth}/${perceivedState.enemy.maxHealth}`);
  console.log(`  Defense: ${perceivedState.enemy.currentDefense}`);
  console.log(`  Chi: ${perceivedState.enemy.resources.chi}`);
  console.log(`  Buffs: ${perceivedState.enemy.buffs.join(', ') || 'None'}`);
  console.log(`  Cooldowns: ${Object.keys(perceivedState.enemy.cooldowns).join(', ') || 'None'}`);
  console.log(`  Last Move: ${perceivedState.enemy.lastMove}`);

  console.log('\n2. Getting Tactical Context...');
  const tacticalContext = getBattleTacticalContext(aang, zuko, battleLog);
  
  console.log('Tactical Analysis:');
  console.log(`  Health Pressure: ${tacticalContext.healthPressure ? 'Yes' : 'No'}`);
  console.log(`  Chi Pressure: ${tacticalContext.chiPressure ? 'Yes' : 'No'}`);
  console.log(`  Is Losing: ${tacticalContext.isLosing ? 'Yes' : 'No'}`);
  console.log(`  Has Momentum: ${tacticalContext.hasMomentum ? 'Yes' : 'No'}`);
  console.log(`  Enemy Vulnerable: ${tacticalContext.enemyVulnerable ? 'Yes' : 'No'}`);
  console.log(`  Enemy Turtling: ${tacticalContext.enemyIsTurtling ? 'Yes' : 'No'}`);
  console.log(`  Enemy Pattern: ${tacticalContext.enemyPattern}`);
  console.log(`  Game Phase: ${tacticalContext.isEarlyGame ? 'Early' : tacticalContext.isMidGame ? 'Mid' : 'Late'}`);
  console.log(`  Damage Ratio: ${tacticalContext.damageRatio.toFixed(2)}`);
  console.log(`  Recent Damage: ${tacticalContext.myRecentDamage} vs ${tacticalContext.enemyRecentDamage}`);

  console.log('\n3. AI Decision Making Example...');
  
  // Example of how AI would use this information
  if (tacticalContext.healthPressure) {
    console.log('AI Decision: Health is low - prioritize defense or healing');
  } else if (tacticalContext.enemyVulnerable && !tacticalContext.chiPressure) {
    console.log('AI Decision: Enemy is vulnerable - go for aggressive attacks');
  } else if (tacticalContext.enemyIsTurtling) {
    console.log('AI Decision: Enemy is turtling - use high-power moves to break defense');
  } else if (tacticalContext.chiPressure) {
    console.log('AI Decision: Low on chi - use low-cost moves or stall');
  } else if (tacticalContext.hasMomentum) {
    console.log('AI Decision: We have momentum - keep up the pressure');
  } else {
    console.log('AI Decision: Standard tactical play');
  }

  console.log('\n=== Example Complete ===');
}

/**
 * @description Example of how to use battle state awareness in a real AI decision function.
 */
export function makeAIDecisionWithAwareness(
  self: BattleCharacter,
  enemy: BattleCharacter,
  turn: number,
  battleLog: BattleLogEntry[]
): string {
  // Get complete battle awareness
  const perceivedState = getPerceivedBattleState(turn, self, enemy, battleLog);
  const tacticalContext = getBattleTacticalContext(self, enemy, battleLog);

  // Decision logic based on tactical context
  if (tacticalContext.healthPressure && tacticalContext.enemyBurstThreat) {
    return 'defend'; // Critical situation - defend at all costs
  }
  
  if (tacticalContext.enemyVulnerable && !tacticalContext.chiPressure) {
    return 'attack'; // Good opportunity - go aggressive
  }
  
  if (tacticalContext.enemyIsTurtling && tacticalContext.burstAvailable) {
    return 'break_defense'; // Break through enemy defense
  }
  
  if (tacticalContext.chiPressure) {
    return 'restore_chi'; // Need to recover resources
  }
  
  if (tacticalContext.hasMomentum) {
    return 'build_momentum'; // Keep the pressure on
  }
  
  return 'standard_attack'; // Default fallback
} 