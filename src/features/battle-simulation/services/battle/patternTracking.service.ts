// CONTEXT: Pattern Tracking Service
// RESPONSIBILITY: Track and analyze character move patterns

import { BattleCharacter } from '../../types';

// Pattern tracking interface
export interface PatternState {
  consecutiveMoves: string[];
  moveCounts: Record<string, number>;
  lastMove: string;
  repositionAttempts: number;
  chargeInterruptions: number;
  totalDamage: number;
  turnsWithoutDamage: number;
  patternStale: boolean;
  forcedEscalation: boolean;
}

// Escalation triggers
const ESCALATION_TRIGGERS = {
  MOVE_REPETITION: 5 // Disable move after 5 consecutive uses (increased from 3)
};

/**
 * @description Tracks pattern state for a character
 */
export function getPatternState(character: BattleCharacter): PatternState {
  const moveHistory = character.moveHistory || [];
  const lastMoves = moveHistory.slice(-ESCALATION_TRIGGERS.MOVE_REPETITION);
  
  const moveCounts: Record<string, number> = {};
  moveHistory.forEach(move => {
    moveCounts[move] = (moveCounts[move] || 0) + 1;
  });
  
  // Check for repetitive patterns - require many more consecutive moves to trigger
  const isRepetitive = lastMoves.length >= 8 && 
    lastMoves.every(move => move === lastMoves[0]);
  
  return {
    consecutiveMoves: lastMoves,
    moveCounts,
    lastMove: moveHistory[moveHistory.length - 1] || '',
    repositionAttempts: character.repositionAttempts || 0,
    chargeInterruptions: character.chargeInterruptions || 0,
    totalDamage: 0, // Will be calculated from battle state
    turnsWithoutDamage: 0, // Will be calculated from battle state
    patternStale: isRepetitive,
    forcedEscalation: character.flags?.forcedEscalation === 'true'
  };
}

/**
 * @description Updates pattern tracking when a move is used
 */
export function updatePatternTracking(
  character: BattleCharacter, 
  moveName: string
): BattleCharacter {
  const updatedCharacter = { ...character };
  
  // Update move history
  if (!updatedCharacter.moveHistory) {
    updatedCharacter.moveHistory = [];
  }
  updatedCharacter.moveHistory.push(moveName);
  
  // Keep only last 20 moves to prevent memory bloat
  if (updatedCharacter.moveHistory.length > 20) {
    updatedCharacter.moveHistory = updatedCharacter.moveHistory.slice(-20);
  }
  
  // Update last move
  updatedCharacter.lastMove = moveName;
  
  return updatedCharacter;
}

/**
 * @description Resets pattern tracking for a character
 */
export function resetPatternTracking(character: BattleCharacter): BattleCharacter {
  return {
    ...character,
    moveHistory: [],
    lastMove: '',
    repositionAttempts: 0,
    chargeInterruptions: 0
  };
} 