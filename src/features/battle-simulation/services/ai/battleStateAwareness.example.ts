// CONTEXT: Battle State Awareness Example
// RESPONSIBILITY: Demonstrate how to use the battle state awareness system
import { getPerceivedBattleState, getBattleTacticalContext } from './battleStateAwareness';
import { BattleCharacter, BattleLogEntry } from '../../types';

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
    stats: {
      power: 85,
      agility: 95,
      defense: 70,
      intelligence: 90
    },
    abilities: [
      {
        name: 'Air Blast',
        type: 'attack',
        power: 2,
        description: 'A powerful blast of compressed air',
        chiCost: 4,
        cooldown: 2,
        maxUses: 5,
        tags: ['piercing'],
        critChance: 0.15,
        critMultiplier: 2.5
      }
    ],
    currentHealth: 75,
    currentDefense: 85,
    cooldowns: { 'Air Blast': 1 },
    usesLeft: {},
    moveHistory: ['Air Blast', 'Basic Strike'],
    resources: { chi: 6 },
    activeEffects: [
      {
        id: 'defense_up_aang_123',
        name: 'Defense Boost',
        type: 'DEFENSE_UP',
        category: 'buff',
        duration: 2,
        potency: 15,
        sourceAbility: 'Air Shield'
      }
    ],
    flags: {},
    diminishingEffects: {},
    position: 'neutral',
    chargeProgress: 0,
    isCharging: false,
    repositionAttempts: 0,
    chargeInterruptions: 0,
    // lastPositionChange: undefined, // Unused, removed for cleanliness
    positionHistory: [],
    personality: 'balanced',
    controlState: 'Neutral',
    stability: 100,
    momentum: 0,
    recoveryOptions: [],
    defensiveStance: 'none',
    mentalState: {
      stability: 100,
      pride: 100,
      activeStates: []
    },
    opponentPerception: {
      aggressionLevel: 0,
      predictability: 50,
      respect: 100
    },
    mentalThresholdsCrossed: {},
    behavioralTraits: [],
    manipulationResilience: 100,
    activeFlags: new Map()
  };

  const zuko: BattleCharacter = {
    id: 'zuko',
    name: 'Zuko',
    image: '/assets/zuko.jpg',
    bending: 'fire',
    stats: {
      power: 80,
      agility: 75,
      defense: 65,
      intelligence: 75
    },
    abilities: [
      {
        name: 'Fire Blast',
        type: 'attack',
        power: 3,
        description: 'A powerful fire attack',
        chiCost: 3,
        cooldown: 1,
        maxUses: 4,
        tags: ['piercing'],
        critChance: 0.12,
        critMultiplier: 2.2
      }
    ],
    currentHealth: 60,
    currentDefense: 65,
    cooldowns: {},
    usesLeft: {},
    moveHistory: ['Fire Blast', 'Basic Strike'],
    resources: { chi: 8 },
    activeEffects: [
      {
        id: 'defense_up_zuko_456',
        name: 'Defense Boost',
        type: 'DEFENSE_UP',
        category: 'buff',
        duration: 1,
        potency: 10,
        sourceAbility: 'Defense Stance'
      }
    ],
    flags: {},
    diminishingEffects: {},
    position: 'neutral',
    chargeProgress: 0,
    isCharging: false,
    repositionAttempts: 0,
    chargeInterruptions: 0,
    // lastPositionChange: undefined, // Unused, removed for cleanliness
    positionHistory: [],
    personality: 'aggressive',
    controlState: 'Neutral',
    stability: 100,
    momentum: 0,
    recoveryOptions: [],
    defensiveStance: 'none',
    mentalState: {
      stability: 100,
      pride: 100,
      activeStates: []
    },
    opponentPerception: {
      aggressionLevel: 0,
      predictability: 50,
      respect: 100
    },
    mentalThresholdsCrossed: {},
    behavioralTraits: [],
    manipulationResilience: 100,
    activeFlags: new Map()
  };

  // Create example battle log
  const battleLog: BattleLogEntry[] = [
    {
      id: 'turn1_aang_air_slice',
      turn: 1,
      actor: 'Aang',
      type: 'MOVE',
      action: 'Air Slice',
      target: 'Zuko',
      result: 'Dealt 20 damage',
      damage: 20,
      abilityType: 'attack',
      timestamp: Date.now() - 3000
    },
    {
      id: 'turn2_zuko_fire_blast',
      turn: 2,
      actor: 'Zuko',
      type: 'MOVE',
      action: 'Fire Blast',
      target: 'Aang',
      result: 'Dealt 25 damage',
      damage: 25,
      abilityType: 'attack',
      timestamp: Date.now() - 2000
    },
    {
      id: 'turn3_aang_air_shield',
      turn: 3,
      actor: 'Aang',
      type: 'MOVE',
      action: 'Air Shield',
      target: 'Self',
      result: 'Increased defense by 25',
      abilityType: 'defense_buff',
      timestamp: Date.now() - 1000
    },
    {
      id: 'turn4_zuko_defense_stance',
      turn: 4,
      actor: 'Zuko',
      type: 'MOVE',
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
  getPerceivedBattleState(currentTurn, aang, zuko, battleLog);
  
  console.log('=== Battle State Awareness Example ===');
  
  console.log(`\n${aang.name}'s State:`);
  console.log(`  Health: ${aang.currentHealth}/100`);
  console.log(`  Defense: ${aang.currentDefense}`);
  console.log(`  Chi: ${aang.resources.chi}`);
  console.log(`  Buffs: ${aang.activeEffects.filter(e => e.category === 'buff').map(e => e.name).join(', ') || 'None'}`);
  console.log(`  Debuffs: ${aang.activeEffects.filter(e => e.category === 'debuff').map(e => e.name).join(', ') || 'None'}`);
  console.log(`  Last Move: ${aang.lastMove || 'None'}`);
  console.log(`  Move History: ${aang.moveHistory.join(' → ')}`);
  
  console.log(`\n${zuko.name}'s State:`);
  console.log(`  Health: ${zuko.currentHealth}/100`);
  console.log(`  Defense: ${zuko.currentDefense}`);
  console.log(`  Chi: ${zuko.resources.chi}`);
  console.log(`  Buffs: ${zuko.activeEffects.filter(e => e.category === 'buff').map(e => e.name).join(', ') || 'None'}`);
  console.log(`  Debuffs: ${zuko.activeEffects.filter(e => e.category === 'debuff').map(e => e.name).join(', ') || 'None'}`);
  console.log(`  Last Move: ${zuko.lastMove || 'None'}`);
  console.log(`  Move History: ${zuko.moveHistory.join(' → ')}`);

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
  getPerceivedBattleState(turn, self, enemy, battleLog);
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