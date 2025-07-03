// CONTEXT: BattleSimulation, // FOCUS: CoreLogic
import { Ability } from '@/common/types';
import { BattleCharacter, BattleState, SimulateBattleParams } from '../types';

/**
 * @description Initializes the state for a new battle.
 * @param {SimulateBattleParams} params - The characters and location.
 * @returns {BattleState} The starting state of the battle.
 */
function createInitialBattleState(params: SimulateBattleParams): BattleState {
  const { player1, player2 } = params;
  const initialHealth = 100; // All characters start with 100 health

  const p1Battle: BattleCharacter = { ...player1, currentHealth: initialHealth, currentDefense: player1.stats.defense };
  const p2Battle: BattleCharacter = { ...player2, currentHealth: initialHealth, currentDefense: player2.stats.defense };

  return {
    participants: [p1Battle, p2Battle],
    turn: 1,
    activeParticipantIndex: p1Battle.stats.agility >= p2Battle.stats.agility ? 0 : 1, // Fastest goes first
    log: [`The battle begins in the ${params.location.name}!`],
    isFinished: false,
    winner: null,
  };
}

/**
 * @description A simple AI to select an ability for the current turn.
 * @param {BattleCharacter} character - The character whose turn it is.
 * @returns {Ability} The chosen ability.
 */
function chooseAbility(character: BattleCharacter): Ability {
  // TEMP: Simple AI logic. Aggressive personalities favor attacks.
  const attackAbilities = character.abilities.filter(a => a.type === 'attack');
  const defenseAbilities = character.abilities.filter(a => a.type === 'defense_buff');

  if (character.personality === 'aggressive' && attackAbilities.length > 0) {
    return attackAbilities[Math.floor(Math.random() * attackAbilities.length)];
  }
  if (character.personality === 'defensive' && defenseAbilities.length > 0 && character.currentHealth < 50) {
    return defenseAbilities[Math.floor(Math.random() * defenseAbilities.length)];
  }
  
  // Default to a random ability
  return character.abilities[Math.floor(Math.random() * character.abilities.length)];
}

/**
 * @description Processes a single turn of the battle.
 * @param {BattleState} currentState - The current state of the battle.
 * @returns {BattleState} The state after the turn is completed.
 */
function processTurn(currentState: BattleState): BattleState {
  const newState = JSON.parse(JSON.stringify(currentState)); // Deep copy to avoid mutation
  const activeIndex = newState.activeParticipantIndex;
  const targetIndex = activeIndex === 0 ? 1 : 0;

  const attacker = newState.participants[activeIndex];
  const target = newState.participants[targetIndex];

  const chosenAbility = chooseAbility(attacker);
  
  // Reset temporary buffs from previous turn
  attacker.currentDefense = attacker.stats.defense;

  let logMessage = `${attacker.name} uses ${chosenAbility.name}!`;

  switch (chosenAbility.type) {
    case 'attack':
      const damage = Math.max(1, chosenAbility.power - target.currentDefense);
      target.currentHealth = Math.max(0, target.currentHealth - damage);
      logMessage += ` It hits ${target.name}, dealing ${damage} damage.`;
      break;
    case 'defense_buff':
      attacker.currentDefense += chosenAbility.power;
      logMessage += ` ${attacker.name}'s defense rises!`;
      break;
  }
  
  newState.log.push(logMessage);

  // Check for winner
  if (target.currentHealth <= 0) {
    newState.isFinished = true;
    newState.winner = attacker;
    newState.log.push(`${target.name} has been defeated! ${attacker.name} is victorious!`);
  } else {
    // Switch to the next participant for the next turn
    newState.activeParticipantIndex = targetIndex;
    newState.turn++;
  }

  return newState;
}

/**
 * @description Runs a full battle simulation instantly, reporting the final state.
 * @param {SimulateBattleParams} params - The setup for the battle.
 * @param {(state: BattleState) => void} onTurnEnd - Callback function to report state after each turn.
 */
export function runTurnBasedSimulation(
  params: SimulateBattleParams,
  onTurnEnd: (state: BattleState) => void
): void {
  let battleState = createInitialBattleState(params);
  onTurnEnd(battleState);

  // Process all turns instantly until battle ends
  while (!battleState.isFinished) {
    battleState = processTurn(battleState);
    onTurnEnd(battleState);
  }
} 