// CONTEXT: Battle Testing, // FOCUS: Desperation Triggers
import { createInitialBattleState } from './state';
import { checkResolutionTriggers } from './resolutionTriggers';
import { processTurn } from './processTurn';
import { availableCharacters } from '../../../character-selection/data/characterData';

/**
 * @description Test desperation triggers by forcing a character to low health
 */
export function testDesperationTriggers() {
  console.log('🧪 Testing Desperation Triggers...');
  
  // Create a battle state
  const battleState = createInitialBattleState({
    player1: availableCharacters[0], // Aang
    player2: availableCharacters[1], // Azula
    location: { id: 'test', name: 'Test Arena', image: '/test.jpg' }
  });
  
  // Force Azula to low health to trigger desperation
  battleState.participants[1].currentHealth = 8; // Below 10 threshold
  battleState.participants[1].resources.chi = 8; // Above 6 threshold
  battleState.participants[1].flags = { usedDesperation: false };
  
  console.log('📊 Battle State:');
  console.log(`  Aang: HP=${battleState.participants[0].currentHealth}, Chi=${battleState.participants[0].resources.chi}`);
  console.log(`  Azula: HP=${battleState.participants[1].currentHealth}, Chi=${battleState.participants[1].resources.chi}, UsedDesperation=${battleState.participants[1].flags?.usedDesperation}`);
  
  // Test resolution triggers for Azula
  const resolution = checkResolutionTriggers(battleState, battleState.participants[1]);
  
  console.log('🎯 Resolution Result:', resolution);
  
  if (resolution && resolution.type === 'desperation') {
    console.log('✅ DESPERATION TRIGGERED!');
    console.log('🔥 Desperation Move:', resolution.move?.name);
    console.log('📝 Log Entry:', resolution.logEntry);
  } else {
    console.log('❌ No desperation trigger');
  }
  
  return resolution;
}

/**
 * @description Test a full battle simulation that should trigger desperation
 */
export function testFullBattleWithDesperation() {
  console.log('🔥 Testing Full Battle with Desperation...');
  
  // Create a battle state
  let battleState = createInitialBattleState({
    player1: availableCharacters[0], // Aang
    player2: availableCharacters[1], // Azula
    location: { id: 'test', name: 'Test Arena', image: '/test.jpg' }
  });
  
  // Simulate several turns to get characters to low health
  console.log('⚔️ Starting battle simulation...');
  
  for (let turn = 1; turn <= 20; turn++) {
    console.log(`\n🔄 Turn ${turn}:`);
    console.log(`  Aang: HP=${battleState.participants[0].currentHealth}, Chi=${battleState.participants[0].resources.chi}`);
    console.log(`  Azula: HP=${battleState.participants[1].currentHealth}, Chi=${battleState.participants[1].resources.chi}`);
    
    // Process the turn
    battleState = processTurn(battleState);
    
    // Check if battle ended
    if (battleState.isFinished) {
      console.log('🏁 Battle ended!');
      console.log('Winner:', battleState.winner?.name);
      break;
    }
    
    // Check if either character should trigger desperation
    const aangResolution = checkResolutionTriggers(battleState, battleState.participants[0]);
    const azulaResolution = checkResolutionTriggers(battleState, battleState.participants[1]);
    
    if (aangResolution && aangResolution.type === 'desperation') {
      console.log('💨 AANG DESPERATION TRIGGERED!');
      break;
    }
    
    if (azulaResolution && azulaResolution.type === 'desperation') {
      console.log('🔥 AZULA DESPERATION TRIGGERED!');
      break;
    }
  }
  
  console.log('\n📋 Final Battle Log:');
  battleState.log.forEach((entry, index) => {
    console.log(`  ${index + 1}. ${entry}`);
  });
  
  return battleState;
}

// Run the tests if this file is executed directly
if (typeof window === 'undefined') {
  console.log('='.repeat(50));
  testDesperationTriggers();
  console.log('='.repeat(50));
  testFullBattleWithDesperation();
} 