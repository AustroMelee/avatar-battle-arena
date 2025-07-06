// CONTEXT: Battle State Management
// RESPONSIBILITY: Initialize, clone, and manage battle state
import { 
  BattleCharacter, 
  BattleState, 
  SimulateBattleParams, 
} from '../../types';
import { getLocationType } from '../../types/move.types';
import { getEnvironmentalFactors } from './positioningMechanics.service';
import { createNarrativeService } from '../narrative';
import { generateOpeningSequence, integrateOpeningSequence } from '../narrative/openingSequence';
import { EnhancedStateManager } from '../narrative/enhancedStateManager';
import { initializeMentalState } from '../identity/mentalState.service';
import { DEFAULT_OPPONENT_PERCEPTION } from '../../data/identities';

// Global enhanced state manager instance
const enhancedStateManager = new EnhancedStateManager();

/**
 * @description Creates the initial battle state with enhanced narrative generation
 * @param {SimulateBattleParams} params - The battle parameters
 * @returns {BattleState} The initial battle state
 */
export function createInitialBattleState(params: SimulateBattleParams): BattleState {
  const { player1, player2, location } = params;
  
  // Reset enhanced state manager for new battle
  enhancedStateManager.reset();
  
  // Create battle characters
  const p1Battle: BattleCharacter = {
    ...player1,
    currentHealth: 100, // All characters start with 100 health
    currentDefense: player1.stats.defense,
    cooldowns: {},
    usesLeft: {},
    moveHistory: [],
    resources: { chi: 10 },
    activeEffects: [], // Unified status effects system
    flags: {},
    diminishingEffects: {},
    position: 'neutral',
    chargeProgress: 0,
    isCharging: false,
    repositionAttempts: 0,
    chargeInterruptions: 0,
    positionHistory: ['neutral'],
    defensiveStance: 'none',
    mentalState: {
      stability: 50,
      pride: 50,
      activeStates: []
    },
    opponentPerception: {
      aggressionLevel: 50,
      predictability: 50,
      respect: 50
    }
  };
  
  const p2Battle: BattleCharacter = {
    ...player2,
    currentHealth: 100,
    currentDefense: player2.stats.defense,
    cooldowns: {},
    usesLeft: {},
    moveHistory: [],
    resources: { chi: 10 },
    activeEffects: [],
    flags: {},
    diminishingEffects: {},
    position: 'neutral',
    chargeProgress: 0,
    isCharging: false,
    repositionAttempts: 0,
    chargeInterruptions: 0,
    positionHistory: [],
    defensiveStance: 'none',
    mentalState: {
      stability: 50,
      pride: 50,
      activeStates: []
    },
    opponentPerception: {
      aggressionLevel: 50,
      predictability: 50,
      respect: 50
    }
  };
  
  // Calculate environmental factors
  const environmentalFactors = getEnvironmentalFactors(location.name);
  const locationType = getLocationType(location.name);
  
  // Generate comprehensive opening sequence
  const openingEntries = generateOpeningSequence(p1Battle, p2Battle, location.name);
  
  // Create initial state without opening sequence
  const initialState: BattleState = {
    participants: [p1Battle, p2Battle],
    turn: 7, // Start battle from turn 7 (after opening sequence turns 1-6)
    activeParticipantIndex: p1Battle.stats.agility >= p2Battle.stats.agility ? 0 : 1, // Fastest goes first
    log: [],
    battleLog: [],
    aiLog: [],
    isFinished: false,
    winner: null,
    location: location.name, // Store location for narrative context
    
    // NEW: Environmental and tactical context
    locationType,
    environmentalFactors,
    tacticalPhase: 'positioning',
    positionAdvantage: 0 // Neutral at start
  };
  
  // Integrate opening sequence into the state
  return integrateOpeningSequence(initialState, openingEntries);
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
  
  // Reset repositioning status at turn end
  newState.participants.forEach(participant => {
    if (participant.position === "repositioning") {
      participant.position = "neutral";
    }
  });
  
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
 * @description Declares a winner and ends the battle with enhanced narrative generation.
 * @param {BattleState} state - The current battle state.
 * @param {BattleCharacter} winner - The winning character.
 * @returns {BattleState} The final battle state.
 */
export function declareWinner(state: BattleState, winner: BattleCharacter): BattleState {
  const newState = cloneBattleState(state);
  newState.isFinished = true;
  newState.winner = winner;
  
  // Get the loser
  const loser = newState.participants.find(p => p.name !== winner.name);
  if (loser) {
    // Generate enhanced victory narrative using the new battle end handler (lazy)
    const narrativeService = createNarrativeService();
    const battleEndNarratives = narrativeService.recordBattleEnd(newState);
    
    // Add victory narratives to the log
    battleEndNarratives.forEach(narrative => {
      newState.log.push(narrative.text);
      newState.battleLog.push({
        id: narrative.id,
        turn: newState.turn,
        actor: narrative.speaker,
        type: 'VICTORY',
        action: 'Battle End',
        result: narrative.text,
        narrative: narrative.text,
        timestamp: narrative.timestamp
      });
    });
  }
  
  return newState;
} 