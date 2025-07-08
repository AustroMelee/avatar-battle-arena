/*
 * @file processTurn.ts
 * @description Executes a single turn in the battle simulation, handling all phase transitions and state updates.
 * @criticality 🩸 Core Battle Logic
 * @owner AustroMelee
 * @lastUpdated 2025-07-08
 * @related tacticalPhase.service.ts, state.ts
 */
// CONTEXT: Battle Turn Processing
// RESPONSIBILITY: Orchestrate the battle turn phases

import { BattleState } from '../../types';
import { cloneBattleState, switchActiveParticipant, getActiveParticipants } from './state';
import { updateMentalState } from '../identity/mentalState.service';
import { cleanupTacticalStates } from './tacticalState.service';
import { processBehavioralSystemForTurn } from '../identity/behavioral.service';
import {
  validateBattleEndPhase,
  processDesperationPhase,
  finisherPhase,
  escalationPhase,
  tacticalMovePhase,
} from './phases';
import { processTurnEffects } from '../effects/statusEffect.service';
import { deduplicateClimaxLogs } from './battleValidation';
import { logStory } from '../utils/mechanicLogUtils';

// Dynamic no-move flavor phrases for processTurn
const NO_MOVE_FLAVORS = [
  (name: string) => `${name} falters, searching for any crack in the enemy’s defense. Sweat beads, resolve hardens. Still—no opening.`,
  (name: string) => `A sharp breath: ${name}'s attack dies before it’s born. Silence presses in. Both warriors wait, poised for a storm.`,
  (name: string) => `Steel in the eyes, but the body refuses: ${name} is locked in a stalemate, every instinct screaming for a path that won’t reveal itself.`,
  (name: string) => `Neither gives ground. ${name}'s feint is read and countered—parry and pause, the tension nearly unbearable.`,
  (name: string) => `Time seems to slow for ${name}. Every movement is matched, every intention anticipated. Not a single strike lands.`,
  (name: string) => `Exhaustion gnaws at ${name}, but pride refuses surrender. For now: only a hush, and the hope of a misstep.`,
  (name: string) => `${name} circles, breathing shallow, eyes never leaving the opponent. A single mistake would be fatal—so neither acts.`,
  (name: string) => `${name} edges forward, testing, baiting, drawing no reaction. The battlefield is heavy with waiting.`,
  (name: string) => `Both combatants draw in their energy, neither willing to risk the next attack. For a heartbeat, the world holds its breath.`
];

// Utility to prevent direct repeats
let lastNoMoveIdx = -1;
function getNoMoveFlavor(name: string): string {
  let idx;
  do {
    idx = Math.floor(Math.random() * NO_MOVE_FLAVORS.length);
  } while (idx === lastNoMoveIdx);
  lastNoMoveIdx = idx;
  return NO_MOVE_FLAVORS[idx](name);
}

// Epilogue flavor lines for climax/deadlock, now much richer
const EPILOGUE_FLAVORS = [
  'The dust settles. Breathless silence reigns—two legends, battered and unbowed, their rivalry burned into memory.',
  'History will record neither a conqueror nor a vanquished. Only the thunderous echo of power unleashed and held in check.',
  'Spectators cannot decide who was greatest; only that neither would yield. Some battles are won by surviving.',
  'Tonight, every flame and gust in the Capital is haunted by the memory of two unstoppable wills. No one who witnessed it will ever forget.',
  'There are fights with winners. This was not one. Only the question of who will be stronger next time remains.',
];

// Utility for epilogue, preventing repeats in multi-line endings
function* epilogueLineGen() {
  let used = new Set<number>();
  while (used.size < EPILOGUE_FLAVORS.length) {
    let idx;
    do {
      idx = Math.floor(Math.random() * EPILOGUE_FLAVORS.length);
    } while (used.has(idx));
    used.add(idx);
    yield EPILOGUE_FLAVORS[idx];
  }
}

/**
 * @description Processes a single turn of the battle using a clean, well-defined phase pipeline.
 * @param {BattleState} currentState - The current state of the battle.
 * @returns {Promise<BattleState>} The state after the turn is completed.
 */
export async function processTurn(currentState: BattleState): Promise<BattleState> {
  let state = cloneBattleState(currentState);

  // --- NEW: Decrement forcedEscalationTurns and clear escalation when expired ---
  state.participants.forEach((participant) => {
    if (participant.flags && typeof participant.flags.forcedEscalationTurns === 'number') {
      if (participant.flags.forcedEscalationTurns > 0) {
        participant.flags.forcedEscalationTurns--;
        if (participant.flags.forcedEscalationTurns <= 0) {
          participant.flags.forcedEscalation = undefined;
          participant.flags.damageMultiplier = undefined;
        }
      }
    }
  });

  // --- PHASE 0: Decrement all move cooldowns for the ACTIVE character ---
  const { attacker: currentAttacker } = getActiveParticipants(state);
  if (currentAttacker.cooldowns) {
    Object.keys(currentAttacker.cooldowns).forEach((moveName) => {
      if (currentAttacker.cooldowns[moveName] > 0) {
        currentAttacker.cooldowns[moveName] = Math.max(0, currentAttacker.cooldowns[moveName] - 1);
      }
    });
  }

  // --- PHASE 1: Start of Turn Effects for the ACTIVE character ---
  const { attacker, target, attackerIndex, targetIndex } = getActiveParticipants(state);
  const effectResult = processTurnEffects(attacker, state.turn);
  const updatedAttacker = effectResult.updatedCharacter;
  state.battleLog.push(...effectResult.logEntries);
  state.participants[attackerIndex] = updatedAttacker;

  if (updatedAttacker.currentHealth <= 0) {
      state.isFinished = true;
      state.winner = target;
      return state;
  }

  // --- PHASE 3: Behavioral & Mental State ---
  const behavioralResult = processBehavioralSystemForTurn(updatedAttacker, target, state);
  state.participants[attackerIndex] = behavioralResult.updatedSelf;
  state.participants[targetIndex] = behavioralResult.updatedOpponent;
  state.battleLog.push(...behavioralResult.logEntries);

  // --- PHASE 4: Battle State Validation & Forced Endings ---
  state = validateBattleEndPhase(state);
  if (state.isFinished || state.climaxTriggered) return state;

  // --- PHASE 5: Escalation & Desperation (Pre-Move) ---
  state = await processDesperationPhase(state);
  if (state.isFinished || state.climaxTriggered) return state;

  state = await escalationPhase(state);
  if (state.isFinished || state.climaxTriggered) return state;

  // --- PHASE 6: Finisher Moves (High Priority) ---
  state = finisherPhase(state);
  if (state.isFinished || state.climaxTriggered) return state;

  // --- PHASE 7: Tactical Move Selection & Execution ---
  const tacticalResult = await tacticalMovePhase(state);
  state = tacticalResult.state;
  state.battleLog.push(...tacticalResult.logEntries);
  if (state.isFinished || state.climaxTriggered) return state;

  // --- PHASE 8: Post-Move Cleanup ---
  if (state.isFinished) return state;
  const turnLogs = state.battleLog.filter(entry => entry.turn === state.turn);
  state.participants.forEach((participant, index) => {
    state.participants[index].mentalState = updateMentalState(participant, turnLogs);
  });
  cleanupTacticalStates(state);

  // --- PHASE 9: End-of-Turn Log Deduplication ---
  state.battleLog = deduplicateClimaxLogs(state.battleLog);

  // --- PHASE 10: Advance Turn, Guarantee a Narrative Log ---
  const hasTurnLog = state.battleLog.some(entry => entry.turn === state.turn);
  if (!hasTurnLog) {
    const { attacker } = getActiveParticipants(state);
    const skippedLog = logStory({
      turn: state.turn,
      actor: 'Narrator',
      narrative: getNoMoveFlavor(attacker.name)
    });
    if (skippedLog) {
      state.battleLog.push(skippedLog);
    }
    state.noMoveTurns = (state.noMoveTurns || 0) + 1;
    if (state.noMoveTurns >= 2) {
      const suddenDeathLog = logStory({
        turn: state.turn,
        actor: 'Narrator',
        narrative: 'Both fighters are frozen, neither daring to act. Sudden Death! Fate demands a resolution—the next blow may be the last.'
      });
      if (suddenDeathLog) {
        state.battleLog.push(suddenDeathLog);
      }
      state.suddenDeathTriggered = true;
    }
  } else {
    state.noMoveTurns = 0;
  }

  // --- Epilogue and result summary after climax or deadlock ---
  if (state.isFinished || state.climaxTriggered) {
    // Remove duplicate end-of-battle logs
    state.battleLog = state.battleLog.filter((entry, idx, arr) => {
      if (entry.type === 'NARRATIVE' && typeof entry.narrative === 'string' &&
          (entry.narrative.includes('deadlock') || entry.narrative.includes('draw') || entry.narrative.includes('Result:'))) {
        return idx === arr.length - 1;
      }
      return true;
    });
    // Add two randomly picked epilogue lines, never the same
    const epilogueGen = epilogueLineGen();
    const epilogue1 = logStory({
      turn: state.turn,
      actor: 'Narrator',
      narrative: epilogueGen.next().value!
    });
    const epilogue2 = logStory({
      turn: state.turn,
      actor: 'Narrator',
      narrative: epilogueGen.next().value!
    });
    if (epilogue1) state.battleLog.push(epilogue1);
    if (epilogue2) state.battleLog.push(epilogue2);
    // Add final result summary
    let resultLine = 'Result: Draw (Deadlock). No one yielded, and no one fell.';
    if (state.winner && state.winner.name) {
      resultLine = `Result: ${state.winner.name} claims victory—history will not soon forget this duel!`;
    }
    const resultLog = logStory({
      turn: state.turn,
      actor: 'Narrator',
      narrative: resultLine
    });
    if (resultLog) state.battleLog.push(resultLog);
  }
  return switchActiveParticipant(state);
}
