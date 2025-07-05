// CONTEXT: Tactical Narrative Service
// RESPONSIBILITY: Generate narrative context and stories for tactical moves

import { BattleState, BattleCharacter } from '../../types';
import { Move } from '../../types/move.types';
import { createNarrativeService } from '../narrative';

/**
 * @description Context data for narrative generation
 */
export interface NarrativeContext {
  damage: number;
  maxHealth: number;
  isMiss: boolean;
  isCritical: boolean;
  isPatternBreak: boolean;
  isEscalation: boolean;
  consecutiveHits: number;
  consecutiveMisses: number;
  turnNumber: number;
  characterState: 'fresh' | 'wounded' | 'exhausted' | 'desperate';
  chi: number;
}

/**
 * @description Result of narrative generation
 */
export interface NarrativeResult {
  narrative: string;
  context: NarrativeContext;
}

/**
 * @description Builds narrative context for tactical moves
 */
export function buildNarrativeContext(
  attacker: BattleCharacter,
  target: BattleCharacter,
  _move: Move,
  damage: number,
  state: BattleState,
  _outcome: 'miss' | 'glance' | 'hit' | 'devastating' | 'overwhelming'
): NarrativeContext {
  return {
    damage,
    maxHealth: target.stats.power + target.stats.defense + target.stats.agility,
    isMiss: damage === 0,
    isCritical: false, // Could be enhanced to detect critical hits
    isPatternBreak: attacker.flags?.forcedEscalation === 'true' && attacker.flags?.damageMultiplier === '2.0',
    isEscalation: attacker.flags?.forcedEscalation === 'true',
    consecutiveHits: 0, // Could be calculated from battle log
    consecutiveMisses: 0, // Could be calculated from battle log
    turnNumber: state.turn,
    characterState: (attacker.flags?.usedDesperation === true ? 'desperate' : 
                   attacker.currentHealth < 30 ? 'wounded' : 
                   attacker.currentHealth < 60 ? 'exhausted' : 'fresh') as 'fresh' | 'wounded' | 'exhausted' | 'desperate',
    chi: attacker.resources.chi || 0
  };
}

/**
 * @description Generates narrative for tactical moves
 */
export async function generateTacticalNarrative(
  attacker: BattleCharacter,
  target: BattleCharacter,
  move: Move,
  damage: number,
  state: BattleState,
  outcome: 'miss' | 'glance' | 'hit' | 'devastating' | 'overwhelming',
  fallbackNarrative?: string
): Promise<NarrativeResult> {
  const narrativeService = createNarrativeService();
  
  const context = buildNarrativeContext(attacker, target, move, damage, state, outcome);
  
  const generatedNarrative = await narrativeService.generateNarrative(
    attacker.name,
    context,
    outcome,
    move.name
  );
  
  const narrative = (generatedNarrative && generatedNarrative.trim()) 
    ? generatedNarrative 
    : fallbackNarrative || `${attacker.name} uses ${move.name} and deals ${damage} damage!`;
  
  return { narrative, context };
}

/**
 * @description Generates narrative for repositioning moves
 */
export async function generateRepositionNarrative(
  attacker: BattleCharacter,
  target: BattleCharacter,
  move: Move,
  damage: number,
  state: BattleState,
  fallbackNarrative?: string
): Promise<NarrativeResult> {
  return await generateTacticalNarrative(
    attacker,
    target,
    move,
    damage,
    state,
    'miss',
    fallbackNarrative || `${attacker.name} repositions to gain advantage!`
  );
}

/**
 * @description Generates narrative for charge-up moves
 */
export async function generateChargeNarrative(
  attacker: BattleCharacter,
  target: BattleCharacter,
  move: Move,
  damage: number,
  state: BattleState,
  isComplete: boolean,
  fallbackNarrative?: string
): Promise<NarrativeResult> {
  const outcome = isComplete ? 'devastating' : 'miss';
  const defaultFallback = isComplete 
    ? `CHARGED ATTACK! ${attacker.name} unleashes ${move.name} for ${damage} damage!`
    : `${attacker.name} continues charging ${move.name}...`;
    
  return await generateTacticalNarrative(
    attacker,
    target,
    move,
    damage,
    state,
    outcome,
    fallbackNarrative || defaultFallback
  );
}

/**
 * @description Generates narrative for charge interruption
 */
export async function generateInterruptionNarrative(
  attacker: BattleCharacter,
  target: BattleCharacter,
  move: Move,
  damage: number,
  state: BattleState,
  fallbackNarrative?: string
): Promise<NarrativeResult> {
  return await generateTacticalNarrative(
    attacker,
    target,
    move,
    damage,
    state,
    'miss',
    fallbackNarrative || `${attacker.name}'s charge is interrupted!`
  );
}

/**
 * @description Generates narrative for regular tactical moves
 */
export async function generateRegularTacticalNarrative(
  attacker: BattleCharacter,
  target: BattleCharacter,
  move: Move,
  damage: number,
  state: BattleState,
  fallbackNarrative?: string
): Promise<NarrativeResult> {
  const outcome = damage === 0 ? 'miss' : 
                 damage < 10 ? 'glance' : 
                 damage < 25 ? 'hit' : 'devastating';
                 
  return await generateTacticalNarrative(
    attacker,
    target,
    move,
    damage,
    state,
    outcome,
    fallbackNarrative || `${attacker.name} uses ${move.name} and deals ${damage} damage!`
  );
} 