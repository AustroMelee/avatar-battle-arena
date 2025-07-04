// CONTEXT: Move Registry Service
// RESPONSIBILITY: Provide character-specific moves

import { Move, AANG_MOVES, AZULA_MOVES } from '../../types/move.types';

/**
 * @description Gets character-specific moves based on character name.
 * @param {string} characterName - The character name
 * @returns {Move[]} Array of available moves for the character
 */
export function getCharacterMoves(characterName: string): Move[] {
  const name = characterName.toLowerCase();
  if (name.includes('aang')) {
    return AANG_MOVES;
  } else if (name.includes('azula')) {
    return AZULA_MOVES;
  }
  // Fallback to Aang moves for unknown characters
  return AANG_MOVES;
} 