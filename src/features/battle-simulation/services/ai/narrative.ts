// CONTEXT: AI Narrative Generation
// RESPONSIBILITY: Generate context-aware battle narration
import { Ability } from '@/common/types';
import { BattleCharacter } from '../../types';
import { MetaState } from './metaState';

/**
 * @description Builds narrative for a move based on character, move, and meta-state.
 * @param {BattleCharacter} character - The character using the move.
 * @param {Ability} move - The move being used.
 * @param {MetaState} meta - The current meta-state.
 * @param {string[]} reasons - The reasons for choosing this move.
 * @returns {string} The narrative text.
 */
export function buildMoveNarrative(
  character: BattleCharacter,
  move: Ability,
  meta: MetaState,
  reasons: string[]
): string {
  const narratives: string[] = [];
  
  // HARD GATING NARRATIVES - Dramatic forced actions
  if (meta.stuckLoop) {
    narratives.push(`${character.name} breaks free from the repetitive pattern with ${move.name}!`);
  }
  
  if (meta.escalationNeeded) {
    narratives.push(`${character.name} escalates dramatically, unleashing ${move.name} with full force!`);
  }
  
  if (meta.finishingTime) {
    narratives.push(`${character.name} channels all their energy into ${move.name} for the decisive blow!`);
  }
  
  if (meta.desperate) {
    narratives.push(`${character.name} fights with desperate determination, risking everything with ${move.name}!`);
  }
  
  if (meta.timeoutPressure) {
    narratives.push(`${character.name} feels time running out and unleashes ${move.name} with maximum intensity!`);
  }
  
  if (meta.stalemate) {
    narratives.push(`${character.name} breaks the stalemate with ${move.name}, piercing through the deadlock!`);
  }
  
  if (meta.bored) {
    narratives.push(`${character.name} shakes things up, deliberately choosing ${move.name} for variety!`);
  }
  
  if (meta.frustrated) {
    narratives.push(`${character.name} unleashes their frustration through ${move.name}!`);
  }
  
  // Meta-state narratives (secondary)
  if (meta.bored && !narratives.some(n => n.includes('shakes things up'))) {
    narratives.push(`${character.name} narrows their eyes. "This pattern is getting predictable..."`);
  }
  
  if (meta.frustrated && !narratives.some(n => n.includes('frustration'))) {
    narratives.push(`${character.name} grits their teeth. "Enough of this!"`);
  }
  
  if (meta.desperate && !narratives.some(n => n.includes('desperate'))) {
    narratives.push(`${character.name} feels the weight of desperation pressing down.`);
  }
  
  // Move-specific narratives
  if (reasons.includes('HARD FINISHER: Forced decisive blow')) {
    narratives.push(`"Time to end this properly!" ${character.name} declares.`);
  }
  
  if (reasons.includes('HARD ESCALATION: Forced dramatic action')) {
    narratives.push(`"No more holding back!" ${character.name} roars.`);
  }
  
  if (reasons.includes('HARD PATTERN BREAK: Forced variety')) {
    narratives.push(`"Enough of this monotony!" ${character.name} thinks.`);
  }
  
  // Default narrative if no hard gating occurred
  if (narratives.length === 0) {
    narratives.push(`${character.name} uses ${move.name}.`);
  }
  
  return narratives.join(' ');
}

/**
 * @description Generates a simple move description.
 * @param {BattleCharacter} character - The character using the move.
 * @param {Ability} move - The move being used.
 * @returns {string} A simple move description.
 */
export function generateSimpleMoveDescription(character: BattleCharacter, move: Ability): string {
  return `${character.name} uses ${move.name}.`;
}

/**
 * @description Generates a dramatic move description.
 * @param {BattleCharacter} character - The character using the move.
 * @param {Ability} move - The move being used.
 * @returns {string} A dramatic move description.
 */
export function generateDramaticMoveDescription(character: BattleCharacter, move: Ability): string {
  const dramaticPhrases = [
    `channels their power into`,
    `unleashes the fury of`,
    `masters the technique of`,
    `perfects the art of`,
    `demonstrates mastery of`
  ];
  
  const phrase = dramaticPhrases[Math.floor(Math.random() * dramaticPhrases.length)];
  return `${character.name} ${phrase} ${move.name}!`;
} 