// @docs
// @description: Main turn-processing logic for Avatar Battle Arena. Registry-driven, plug-and-play architecture: all state, log, and move lookups are data/registry-based. No hard-coded content. Extensible via data/registries only. SRP-compliant. See SYSTEM ARCHITECTURE.MD for integration points.
// @criticality: ⚔️ Core Logic
// @owner: AustroMelee
// @tags: core-logic, turn, logging, SRP, registry, plug-and-play, extensibility
//
// This file should never reference character, move, or narrative content directly. All extensibility is via data/registries.
//
// Updated for 2025 registry-driven architecture overhaul.

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
import { deduplicateClimaxLogs, forceBattleClimax } from './battleValidation';
import { logStory } from '../utils/mechanicLogUtils';
import { isBasicMove } from '../ai/moveSelection';
import { nes } from '@/common/branding/nonEmptyString';
import { getMoveById } from '../../data/moves';

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
  () => `Both combatants draw in their energy, neither willing to risk the next attack. For a heartbeat, the world holds its breath.`
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
  const used = new Set<number>();
  while (used.size < EPILOGUE_FLAVORS.length) {
    let idx;
    do {
      idx = Math.floor(Math.random() * EPILOGUE_FLAVORS.length);
    } while (used.has(idx));
    used.add(idx);
    yield EPILOGUE_FLAVORS[idx];
  }
}

const poeticFinalResultLines = [
  "The clash fades, not in triumph, but in exhaustion—no victor rises, only the silence of spent ambition.",
  "Steel and spirit yield to fatigue; the world bears witness as neither hero nor villain claims the day.",
  "Victory slips from their grasp; what remains is only the hush of lessons learned in failure and persistence.",
  "The arena grows still—struggle dissolves into emptiness, and glory is postponed to another dawn.",
  "Both warriors retreat, battered and changed. The story ends, not with conquest, but with the echo of what might have been.",
  "Futility crowns the moment; sweat and determination buy only a truce, not a legend.",
  "Even legends must yield to weariness—the duel becomes a memory, unfinished, unresolved.",
  "No fire blazes, no wind roars; what endures is the truth that not every battle can be won.",
  "As the dust settles, hope and regret mingle. This day belongs to neither—only to the weary silence between heartbeats.",
  "Defeat and victory dissolve together, leaving only the arena’s quiet and the promise of rematch beneath another sky."
];

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

  // --- ENFORCE CHARGE RELEASE: If active participant is charging, force release move ---
  const active = state.participants[state.activeParticipantIndex];
  if (active.status === 'charging' && active.pendingReleaseMoveId) {
    const releaseMove = getMoveById(active.pendingReleaseMoveId);
    if (releaseMove) {
      // Auto-execute release move
      console.log('[DEBUG] Auto-executing release move after charging:', releaseMove.name);
      // Execute the release move directly
      const { attacker: relAttacker, target: relTarget, attackerIndex: relAttackerIndex, targetIndex: relTargetIndex } = getActiveParticipants(state);
      const { newAttacker, newTarget, logEntries } = await import('./tacticalMove.service').then(m => m.executeTacticalMove(releaseMove, relAttacker, relTarget, state));
      // Reset charging state
      newAttacker.status = undefined;
      newAttacker.pendingReleaseMoveId = undefined;
      // Update state
      state.participants[relAttackerIndex] = newAttacker;
      state.participants[relTargetIndex] = newTarget;
      state.battleLog.push(...logEntries);
      return state;
    } else {
      console.error('ERROR: Charging but releaseMoveId not found in move data!');
      state.isFinished = true;
      return state;
    }
  }

  // --- ENGINE-LEVEL FORCED ENDING (Pattern Adaptation Breaker) ---
  if (state.forcedEnding) {
    // Dramatic, cinematic forced ending for climax or deadlock
    let endingNarrative = '';
    if (state.tacticalPhase === 'climax') {
      // Use a unique, cinematic climax ending
      const climaxLines = [
        'The arena erupts in a final, desperate clash—neither fighter yields, but the world itself seems to shudder at their will.',
        'A storm of power and resolve collides; the outcome is not victory, but legend. The battle ends, but its echo will never fade.',
        'Both warriors unleash everything in a final, blinding exchange. When the dust settles, there is no clear victor—only awe and silence.',
        'The climax arrives: a crescendo of fury and skill. The duel ends not with defeat, but with mutual respect and exhaustion.',
        'History will remember this as the day two legends met and neither could break the other. The world holds its breath as the battle ends.'
      ];
      endingNarrative = climaxLines[Math.floor(Math.random() * climaxLines.length)];
    } else {
      // Use or expand EPILOGUE_FLAVORS for non-climax forced endings
      endingNarrative = EPILOGUE_FLAVORS[Math.floor(Math.random() * EPILOGUE_FLAVORS.length)];
    }
    const forcedEndingLog = logStory({
      turn: state.turn,
      narrative: nes(endingNarrative),
    });
    if (forcedEndingLog) {
      state.battleLog.push(forcedEndingLog);
    }
    state.isFinished = true;
    state.suddenDeathTriggered = true;
    return state;
  }

  // --- PHASE 6: Finisher Moves (High Priority) ---
  state = finisherPhase(state);
  if (state.isFinished || state.climaxTriggered) return state;

  // --- PHASE 7: Tactical Move Selection & Execution ---
  const tacticalResult = await tacticalMovePhase(state);
  state = tacticalResult.state;
  state.battleLog.push(...tacticalResult.logEntries);
  // (No further processTurnEffects call here)

  // --- PHASE 8: Post-Move Cleanup ---
  if (state.isFinished) return state;
  const turnLogs = state.battleLog.filter(entry => entry.turn === state.turn);
  state.participants.forEach((participant, index) => {
    state.participants[index].mentalState = updateMentalState(participant, turnLogs);
  });
  cleanupTacticalStates(state);

  // TEMP LOG: End of turn, before stalemate check
  console.log('[DEBUG] End of Turn', {
    turn: state.turn,
    turnsSinceLastDamage: state.analytics.turnsSinceLastDamage,
    tacticalStalemateCounter: state.tacticalStalemateCounter,
    battleLogLength: state.battleLog.length
  });

  // --- STALEMATE/DEADLOCK FORCING LOGIC ---
  // Detect no damage/progress for X turns (X=5)
  // --- FIX: Only check for stalemate after warmup period ---
  if (state.turn < 4) {
    // TEMP LOG: Skipping stalemate check during warmup period
    console.log('[DEBUG] Skipping stalemate check: warmup period', { turn: state.turn });
    // Continue with rest of turn processing
    // --- PHASE 9: End-of-Turn Log Deduplication ---
    state.battleLog = deduplicateClimaxLogs(state.battleLog);
    // --- PHASE 10: Advance Turn, Guarantee a Narrative Log ---
    const hasTurnLog = state.battleLog.some(entry => entry.turn === state.turn);
    if (!hasTurnLog) {
      const { attacker } = getActiveParticipants(state);
      const skippedLog = logStory({
        turn: state.turn,
        narrative: nes(getNoMoveFlavor(attacker.name) || '—'),
      });
      if (skippedLog) {
        state.battleLog.push(skippedLog);
      }
      state.noMoveTurns = (state.noMoveTurns || 0) + 1;
    } else {
      state.noMoveTurns = 0;
    }
    // TEMP LOG: End of Turn (final, warmup)
    console.log('[DEBUG] End of Turn (final, warmup)', {
      turn: state.turn,
      turnsSinceLastDamage: state.analytics.turnsSinceLastDamage,
      tacticalStalemateCounter: state.tacticalStalemateCounter,
      battleLogLength: state.battleLog.length
    });
    return switchActiveParticipant(state);
  }

  const X = 5;
  const Y = 5; // Increased forced ending threshold
  state.analytics.turnsSinceLastDamage = state.analytics.turnsSinceLastDamage || 0;
  // TEMP LOG: Before stalemate check
  console.log('[DEBUG] Before stalemate check', {
    turn: state.turn,
    turnsSinceLastDamage: state.analytics.turnsSinceLastDamage,
    tacticalStalemateCounter: state.tacticalStalemateCounter,
    battleLogLength: state.battleLog.length
  });
  const lastDamage = state.battleLog.slice(-X).some(log => log.damage && log.damage > 0);
  // --- FIX: Only increment stalemate counter if both last moves were attack (not charge/setup) ---
  let bothAttacked = false;
  if (state.battleLog.length >= 2) {
    const lastTwoLogs = state.battleLog.slice(-2);
    bothAttacked = lastTwoLogs.every(log => log.details?.moveType === 'attack' && log.damage !== undefined);
  }
  // TEMP LOG: Damage detected in last X turns? and bothAttacked
  console.log('[DEBUG] Damage detected in last', X, 'turns:', lastDamage, 'bothAttacked:', bothAttacked);
  if (!lastDamage && bothAttacked) {
    state.tacticalStalemateCounter = (state.tacticalStalemateCounter || 0) + 1;
    if (state.analytics) state.analytics.stalematePreventions = (state.analytics.stalematePreventions || 0) + 1;
    // System log for stalemate detection
    const stalemateLog = logStory({
      turn: state.turn,
      narrative: nes(`[SYSTEM] Stalemate detected: No damage for ${X} turns. Cycle ${state.tacticalStalemateCounter}.`)
    });
    if (stalemateLog) state.battleLog.push(stalemateLog);
    // TEMP LOG: After stalemate increment
    console.log('[DEBUG] After stalemate increment', {
      turn: state.turn,
      turnsSinceLastDamage: state.analytics.turnsSinceLastDamage,
      tacticalStalemateCounter: state.tacticalStalemateCounter,
      battleLogLength: state.battleLog.length
    });
    // After Y cycles, force ending
    if (state.tacticalStalemateCounter >= Y) {
      const forcedEndingLog = logStory({
        turn: state.turn,
        narrative: nes('[SYSTEM] Forced ending: Multiple stalemate cycles reached. Forcing dramatic resolution.')
      });
      if (forcedEndingLog) state.battleLog.push(forcedEndingLog);
      state = forceBattleClimax(state);
      state.forcedEnding = true;
      // TEMP LOG: Forced ending triggered
      console.log('[DEBUG] Forced ending triggered', {
        turn: state.turn,
        turnsSinceLastDamage: state.analytics.turnsSinceLastDamage,
        tacticalStalemateCounter: state.tacticalStalemateCounter,
        battleLogLength: state.battleLog.length
      });
      return state;
    } else {
      // Otherwise, force both sides to use their most powerful available move next turn
      // (Handled by forceBattleClimax if needed, or by tactical move selection logic)
    }
  } else if (lastDamage) {
    // Reset counter if damage occurs
    state.tacticalStalemateCounter = 0;
    // TEMP LOG: Damage occurred, stalemate counter reset
    console.log('[DEBUG] Damage occurred, stalemate counter reset', {
      turn: state.turn,
      turnsSinceLastDamage: state.analytics.turnsSinceLastDamage,
      tacticalStalemateCounter: state.tacticalStalemateCounter,
      battleLogLength: state.battleLog.length
    });
  } else {
    // TEMP LOG: Skipping stalemate increment (not both attacked)
    console.log('[DEBUG] Skipping stalemate increment: not both attacked', {
      turn: state.turn,
      turnsSinceLastDamage: state.analytics.turnsSinceLastDamage,
      tacticalStalemateCounter: state.tacticalStalemateCounter,
      battleLogLength: state.battleLog.length
    });
  }

  // --- PHASE 9: End-of-Turn Log Deduplication ---
  state.battleLog = deduplicateClimaxLogs(state.battleLog);

  // --- PHASE 10: Advance Turn, Guarantee a Narrative Log ---
  const hasTurnLog = state.battleLog.some(entry => entry.turn === state.turn);
  if (!hasTurnLog) {
    const { attacker } = getActiveParticipants(state);
    const skippedLog = logStory({
      turn: state.turn,
      narrative: nes(getNoMoveFlavor(attacker.name) || '—'),
    });
    if (skippedLog) {
      state.battleLog.push(skippedLog);
    }
    state.noMoveTurns = (state.noMoveTurns || 0) + 1;
    // --- ENGINE-LEVEL STALEMATE BREAKER ---
    const N = 3; // Number of turns to check for staleness
    const allBasic = state.participants.every(participant => {
      if (!participant.moveHistory || participant.moveHistory.length < N) return false;
      const recent = participant.moveHistory.slice(-N);
      // All recent moves are basic
      return recent.every(moveId => {
        const move = participant.abilities.find(m => m.id === moveId);
        return move && isBasicMove(move);
      });
    });
    if (allBasic) {
      const stalemateLog = logStory({
        turn: state.turn,
        narrative: nes('Both fighters are spent and fall into a predictable rhythm—no victory is possible. The duel ends in exhausted stalemate.'),
      });
      if (stalemateLog) {
        state.battleLog.push(stalemateLog);
      }
      state.isFinished = true;
      state.suddenDeathTriggered = true;
      // TEMP LOG: All basic moves stalemate
      console.log('[DEBUG] All basic moves stalemate', {
        turn: state.turn,
        turnsSinceLastDamage: state.analytics.turnsSinceLastDamage,
        tacticalStalemateCounter: state.tacticalStalemateCounter,
        battleLogLength: state.battleLog.length
      });
      return state;
    }
    if (state.noMoveTurns >= 2) {
      const suddenDeathLog = logStory({
        turn: state.turn,
        narrative: nes('Both fighters are frozen, neither daring to act. Sudden Death! Fate demands a resolution—the next blow may be the last.'),
      });
      if (suddenDeathLog) {
        state.battleLog.push(suddenDeathLog);
      }
      state.suddenDeathTriggered = true;
      // TEMP LOG: Sudden death triggered
      console.log('[DEBUG] Sudden death triggered', {
        turn: state.turn,
        turnsSinceLastDamage: state.analytics.turnsSinceLastDamage,
        tacticalStalemateCounter: state.tacticalStalemateCounter,
        battleLogLength: state.battleLog.length
      });
    }
  } else {
    state.noMoveTurns = 0;
  }

  // TEMP LOG: End of turn (final)
  console.log('[DEBUG] End of Turn (final)', {
    turn: state.turn,
    turnsSinceLastDamage: state.analytics.turnsSinceLastDamage,
    tacticalStalemateCounter: state.tacticalStalemateCounter,
    battleLogLength: state.battleLog.length
  });

  // --- Epilogue and result summary after climax or deadlock ---
  if (state.isFinished || state.climaxTriggered) {
    // Remove duplicate end-of-battle logs
    state.battleLog = state.battleLog.filter((entry, idx, arr) => {
      if (entry.type === 'narrative' && typeof entry.narrative === 'string' &&
          (entry.narrative.includes('deadlock') || entry.narrative.includes('draw') || entry.narrative.includes('Result:'))) {
        return idx === arr.length - 1;
      }
      return true;
    });
    // Add two randomly picked epilogue lines, never the same
    const epilogueGen = epilogueLineGen();
    const epilogue1 = logStory({
      turn: state.turn,
      narrative: nes(epilogueGen.next().value || '—'),
    });
    const epilogue2 = logStory({
      turn: state.turn,
      narrative: nes(epilogueGen.next().value || '—'),
    });
    if (epilogue1) state.battleLog.push(epilogue1);
    if (epilogue2) state.battleLog.push(epilogue2);
    // Add final result summary
    const resultLog = logStory({
      turn: state.turn,
      narrative: nes(poeticFinalResultLines[Math.floor(Math.random() * poeticFinalResultLines.length)] || '—'),
    });
    if (resultLog) state.battleLog.push(resultLog);
  }
  return switchActiveParticipant(state);
}
