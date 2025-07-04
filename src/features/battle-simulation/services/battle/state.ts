// CONTEXT: Battle State Management
// RESPONSIBILITY: Initialize, clone, and manage battle state
import { 
  BattleCharacter, 
  BattleState, 
  SimulateBattleParams, 
  BattleLogEntry
} from '../../types';
import { createEventId } from '../ai/logQueries';

/**
 * @description Initializes the state for a new battle.
 * @param {SimulateBattleParams} params - The characters and location.
 * @returns {BattleState} The starting state of the battle.
 */
export function createInitialBattleState(params: SimulateBattleParams): BattleState {
  const { player1, player2 } = params;
  const initialHealth = 100; // All characters start with 100 health
  const initialChi = 10; // All characters start with 10 chi

  // Initialize usesLeft for abilities with maxUses
  const p1UsesLeft: Record<string, number> = {};
  player1.abilities.forEach(ability => {
    if (ability.maxUses) {
      p1UsesLeft[ability.name] = ability.maxUses;
    }
  });
  
  const p2UsesLeft: Record<string, number> = {};
  player2.abilities.forEach(ability => {
    if (ability.maxUses) {
      p2UsesLeft[ability.name] = ability.maxUses;
    }
  });

  const p1Battle: BattleCharacter = { 
    ...player1, 
    currentHealth: initialHealth, 
    currentDefense: player1.stats.defense,
    cooldowns: {}, // No cooldowns at battle start
    usesLeft: p1UsesLeft, // Initialize uses for limited moves
    moveHistory: [], // No moves used yet
    resources: { chi: initialChi },
    activeBuffs: [], // No buffs at battle start
    activeDebuffs: [], // No debuffs at battle start
    flags: {
      usedFinisher: false,
      usedDesperation: false
    }, // Initialize flags for resolution tracking
    diminishingEffects: {} // Initialize diminishing effects tracking
  };
  
  const p2Battle: BattleCharacter = { 
    ...player2, 
    currentHealth: initialHealth, 
    currentDefense: player2.stats.defense,
    cooldowns: {}, // No cooldowns at battle start
    usesLeft: p2UsesLeft, // Initialize uses for limited moves
    moveHistory: [], // No moves used yet
    resources: { chi: initialChi },
    activeBuffs: [], // No buffs at battle start
    activeDebuffs: [], // No debuffs at battle start
    flags: {
      usedFinisher: false,
      usedDesperation: false
    }, // Initialize flags for resolution tracking
    diminishingEffects: {} // Initialize diminishing effects tracking
  };

  const initialLogEntry: BattleLogEntry = {
    id: createEventId(),
    turn: 0,
    actor: 'System',
    type: 'INFO',
    action: 'Battle Start',
    result: `The battle begins in the ${params.location.name}!`,
    narrative: `The air crackles with anticipation as ${player1.name} and ${player2.name} face off in the ${params.location.name}.`,
    timestamp: Date.now()
  };

  return {
    participants: [p1Battle, p2Battle],
    turn: 1,
    activeParticipantIndex: p1Battle.stats.agility >= p2Battle.stats.agility ? 0 : 1, // Fastest goes first
    log: [`The battle begins in the ${params.location.name}!`],
    battleLog: [initialLogEntry],
    aiLog: [],
    isFinished: false,
    winner: null,
    location: params.location.name, // Store location for narrative context
  };
}

/**
 * @description Creates a deep copy of battle state to avoid mutations.
 * @param {BattleState} state - The state to clone.
 * @returns {BattleState} A deep copy of the state.
 */
export function cloneBattleState(state: BattleState): BattleState {
  return JSON.parse(JSON.stringify(state));
}

/**
 * @description Gets the attacker and target from current battle state.
 * @param {BattleState} state - The current battle state.
 * @returns {{attacker: BattleCharacter, target: BattleCharacter, attackerIndex: number, targetIndex: number}} The attacker and target.
 */
export function getActiveParticipants(state: BattleState): {
  attacker: BattleCharacter;
  target: BattleCharacter;
  attackerIndex: number;
  targetIndex: number;
} {
  const attackerIndex = state.activeParticipantIndex;
  const targetIndex = attackerIndex === 0 ? 1 : 0;
  
  return {
    attacker: state.participants[attackerIndex],
    target: state.participants[targetIndex],
    attackerIndex,
    targetIndex
  };
}

/**
 * @description Switches the active participant for the next turn.
 * @param {BattleState} state - The current battle state.
 * @returns {BattleState} The state with switched active participant.
 */
export function switchActiveParticipant(state: BattleState): BattleState {
  const newState = cloneBattleState(state);
  newState.activeParticipantIndex = newState.activeParticipantIndex === 0 ? 1 : 0;
  newState.turn++;
  return newState;
}

/**
 * @description Checks if the battle has reached a terminal state.
 * @param {BattleState} state - The current battle state.
 * @returns {boolean} True if battle should end.
 */
export function isBattleTerminal(state: BattleState): boolean {
  return state.isFinished || 
         state.participants.some(p => p.currentHealth <= 0) ||
         state.turn > 50; // Max turns
}

/**
 * @description Declares a winner and ends the battle.
 * @param {BattleState} state - The current battle state.
 * @param {BattleCharacter} winner - The winning character.
 * @returns {BattleState} The final battle state.
 */
export function declareWinner(state: BattleState, winner: BattleCharacter): BattleState {
  const newState = cloneBattleState(state);
  newState.isFinished = true;
  newState.winner = winner;
  
  const victoryLogEntry: BattleLogEntry = {
    id: createEventId(),
    turn: newState.turn,
    actor: 'System',
    type: 'KO',
    action: 'Victory',
    result: `${winner.name} is victorious!`,
    narrative: `The battle reaches its climax as ${winner.name} stands triumphant.`,
    timestamp: Date.now()
  };
  
  newState.log.push(victoryLogEntry.result);
  newState.battleLog.push(victoryLogEntry);
  
  return newState;
} 