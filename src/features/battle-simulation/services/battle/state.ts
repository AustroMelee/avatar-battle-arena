/*
 * @file state.ts
 * @description Defines and manages the core battle state for the simulation, including initialization and mutation helpers.
 * @criticality 🩸 Core State
 * @owner AustroMelee
 * @lastUpdated 2025-07-08
 * @related processTurn.ts, battleSimulator.service.ts
 */
// CONTEXT: Battle State Management
// RESPONSIBILITY: Initialize, clone, and manage battle state
import { 
  BattleCharacter, 
  BattleState, 
  SimulateBattleParams, 
  BattleAnalytics,
} from '../../types';
import { getLocationType } from '../../types/move.types';
import { getEnvironmentalFactors } from './positioningMechanics.service';
import { createNarrativeService } from '../narrative';
import { generateOpeningSequence, integrateOpeningSequence } from '../narrative/openingSequence';
import { EnhancedStateManager } from '../narrative/enhancedStateManager';
import { initializeMentalState } from '../identity/mentalState.service';
import { DEFAULT_OPPONENT_PERCEPTION } from '../../data/identities';
import { getDefaultArcState, getDefaultArcStateHistory } from '../../data/arcTransitions';
import { initializeBehavioralSystem, initializeActiveFlags } from '../identity/behavioral.service';
import { getCharacterMoves } from './moveRegistry.service';

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
  const analytics: BattleAnalytics = {
    totalDamage: 0,
    totalChiSpent: 0,
    turnsSinceLastDamage: 0,
    averageDamagePerTurn: 0,
    lastUpdatedTurn: 0,
    patternAdaptations: 0,
    stalematePreventions: 0,
    escalationEvents: 0,
    punishOpportunities: 0,
    criticalHits: 0,
    desperationMoves: 0,
    lastUpdated: 0,
    stalematePreventionTriggered: false,
  };
  
  const p1Battle: BattleCharacter = {
    base: player1,
    id: player1.id,
    name: player1.name,
    currentHealth: 100, // All characters start with 100 health
    currentDefense: player1.stats.defense,
    cooldowns: {},
    usesLeft: {},
    moveHistory: [],
    resources: { chi: 10 },
    activeEffects: [], // Unified status effects system
    flags: { stuckMoveCounter: 0, escalationCycleCount: 0 },
    diminishingEffects: {},
    position: 'neutral',
    chargeProgress: 0,
    isCharging: false,
    repositionAttempts: 0,
    chargeInterruptions: 0,
    positionHistory: ['neutral'],
    defensiveStance: 'none',
    mentalState: initializeMentalState(),
    opponentPerception: DEFAULT_OPPONENT_PERCEPTION,
    mentalThresholdsCrossed: {},
    behavioralTraits: initializeBehavioralSystem(player1),
    manipulationResilience: player1.manipulationResilience || 50,
    activeFlags: initializeActiveFlags(),
    controlState: 'Neutral',
    stability: 50,
    momentum: 50,
    recoveryOptions: [],
    analytics: { ...analytics },
    tacticalStalemateCounter: 0,
    lastTacticalPriority: '',
    abilities: getCharacterMoves(player1.name),
  };
  
  const p2Battle: BattleCharacter = {
    base: player2,
    id: player2.id,
    name: player2.name,
    currentHealth: 100,
    currentDefense: player2.stats.defense,
    cooldowns: {},
    usesLeft: {},
    moveHistory: [],
    resources: { chi: 10 },
    activeEffects: [],
    flags: { stuckMoveCounter: 0, escalationCycleCount: 0 },
    diminishingEffects: {},
    position: 'neutral',
    chargeProgress: 0,
    isCharging: false,
    repositionAttempts: 0,
    chargeInterruptions: 0,
    positionHistory: ['neutral'],
    defensiveStance: 'none',
    mentalState: initializeMentalState(),
    opponentPerception: DEFAULT_OPPONENT_PERCEPTION,
    mentalThresholdsCrossed: {},
    behavioralTraits: initializeBehavioralSystem(player2),
    manipulationResilience: player2.manipulationResilience || 50,
    activeFlags: initializeActiveFlags(),
    controlState: 'Neutral',
    stability: 50,
    momentum: 50,
    recoveryOptions: [],
    analytics: { ...analytics },
    tacticalStalemateCounter: 0,
    lastTacticalPriority: '',
    abilities: getCharacterMoves(player2.name),
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
    activeParticipantIndex: player1.stats.agility >= player2.stats.agility ? 0 : 1, // Fastest goes first
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
    positionAdvantage: 0, // Neutral at start
    
    // NEW: Dynamic Escalation Timeline
    arcState: getDefaultArcState(),
    arcStateHistory: getDefaultArcStateHistory(),
    analytics: { ...analytics },
    // --- NEW: Initialize tactical stalemate fields ---
    tacticalStalemateCounter: 0,
    lastTacticalPriority: '',
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