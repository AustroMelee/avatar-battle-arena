// CONTEXT: AI Pattern Recognition System
// RESPONSIBILITY: Analyze move patterns and adapt AI behavior accordingly

import { BattleCharacter, BattleLogEntry } from '../../types';

/**
 * @description Represents a detected move pattern.
 */
export interface MovePattern {
  moveName: string;
  frequency: number;
  lastUsed: number;
  consecutiveUses: number;
  isSpam: boolean;
}

/**
 * @description Represents pattern analysis results.
 */
export interface PatternAnalysis {
  detectedPatterns: MovePattern[];
  recommendedCounters: string[];
  antiSpamMoves: string[];
  patternStrength: 'weak' | 'medium' | 'strong';
}

/**
 * @description Analyzes the move history to detect patterns.
 * @param {BattleCharacter} character - The character whose moves to analyze.
 * @param {BattleLogEntry[]} battleLog - The battle log to analyze.
 * @param {number} lookbackTurns - How many turns to look back for patterns.
 * @returns {MovePattern[]} Array of detected patterns.
 */
export function detectMovePatterns(
  character: BattleCharacter,
  battleLog: BattleLogEntry[],
  lookbackTurns: number = 5
): MovePattern[] {
  const patterns: Map<string, MovePattern> = new Map();
  const recentTurns = battleLog
    .filter(entry => entry.actor === character.name)
    .slice(-lookbackTurns);

  recentTurns.forEach((entry, index) => {
    const moveName = entry.action;
    const turnNumber = entry.turn;
    
    if (!patterns.has(moveName)) {
      patterns.set(moveName, {
        moveName,
        frequency: 0,
        lastUsed: turnNumber,
        consecutiveUses: 0,
        isSpam: false
      });
    }
    
    const pattern = patterns.get(moveName)!;
    pattern.frequency++;
    pattern.lastUsed = turnNumber;
    
    // Check for consecutive uses
    if (index > 0 && recentTurns[index - 1].action === moveName) {
      pattern.consecutiveUses++;
    } else {
      pattern.consecutiveUses = 1;
    }
    
    // Mark as spam if used too frequently
    pattern.isSpam = pattern.frequency >= 3 || pattern.consecutiveUses >= 2;
  });

  return Array.from(patterns.values());
}

/**
 * @description Analyzes opponent's patterns to recommend counter strategies.
 * @param {BattleCharacter} opponent - The opponent to analyze.
 * @param {BattleLogEntry[]} battleLog - The battle log to analyze.
 * @returns {PatternAnalysis} Analysis results with counter recommendations.
 */
export function analyzeOpponentPatterns(
  opponent: BattleCharacter,
  battleLog: BattleLogEntry[]
): PatternAnalysis {
  const patterns = detectMovePatterns(opponent, battleLog);
  const recommendedCounters: string[] = [];
  const antiSpamMoves: string[] = [];
  
  // Analyze each detected pattern
  patterns.forEach(pattern => {
    if (pattern.isSpam) {
      // Recommend counters for spammed moves
      switch (pattern.moveName) {
        case 'Air Blast':
        case 'Blue Fire':
          recommendedCounters.push('defense_buff');
          antiSpamMoves.push('Air Shield', 'Fire Jets');
          break;
        case 'Wind Slice':
        case 'Phoenix Recovery':
          recommendedCounters.push('attack');
          antiSpamMoves.push('Air Blast', 'Blue Fire');
          break;
        case 'Air Shield':
        case 'Fire Jets':
          recommendedCounters.push('piercing');
          antiSpamMoves.push('Wind Slice', 'Lightning Storm');
          break;
        default:
          recommendedCounters.push('attack');
          break;
      }
    }
  });
  
  // Determine pattern strength
  const spamCount = patterns.filter(p => p.isSpam).length;
  const patternStrength: 'weak' | 'medium' | 'strong' = 
    spamCount === 0 ? 'weak' : 
    spamCount <= 2 ? 'medium' : 'strong';
  
  return {
    detectedPatterns: patterns,
    recommendedCounters: [...new Set(recommendedCounters)],
    antiSpamMoves: [...new Set(antiSpamMoves)],
    patternStrength
  };
}

/**
 * @description Checks if a move should be avoided due to recent overuse.
 * @param {string} moveName - The move to check.
 * @param {BattleCharacter} character - The character using the move.
 * @param {BattleLogEntry[]} battleLog - The battle log to analyze.
 * @returns {boolean} True if the move should be avoided.
 */
export function shouldAvoidMove(
  moveName: string,
  character: BattleCharacter,
  battleLog: BattleLogEntry[]
): boolean {
  const patterns = detectMovePatterns(character, battleLog, 3);
  const pattern = patterns.find(p => p.moveName === moveName);
  
  if (!pattern) return false;
  
  // Avoid if used consecutively or too frequently
  return pattern.consecutiveUses >= 2 || pattern.frequency >= 3;
}

/**
 * @description Gets anti-pattern moves based on opponent's recent behavior.
 * @param {BattleCharacter} self - The AI character.
 * @param {BattleCharacter} opponent - The opponent to counter.
 * @param {BattleLogEntry[]} battleLog - The battle log to analyze.
 * @returns {string[]} Array of move names that counter the opponent's patterns.
 */
export function getAntiPatternMoves(
  self: BattleCharacter,
  opponent: BattleCharacter,
  battleLog: BattleLogEntry[]
): string[] {
  const analysis = analyzeOpponentPatterns(opponent, battleLog);
  const availableMoves = self.abilities
    .filter(ability => 
      !shouldAvoidMove(ability.name, self, battleLog) &&
      (self.resources.chi || 0) >= (ability.chiCost || 0) &&
      (!ability.cooldown || !self.cooldowns[ability.name] || self.cooldowns[ability.name] === 0)
    )
    .map(ability => ability.name);
  
  // Prioritize anti-spam moves
  const antiSpamMoves = availableMoves.filter(move => 
    analysis.antiSpamMoves.includes(move)
  );
  
  return antiSpamMoves.length > 0 ? antiSpamMoves : availableMoves;
}

/**
 * @description Generates narrative for pattern recognition events.
 * @param {BattleCharacter} character - The character adapting.
 * @param {PatternAnalysis} analysis - The pattern analysis results.
 * @returns {string} Narrative text describing the adaptation.
 */
export function generatePatternNarrative(
  character: BattleCharacter,
  analysis: PatternAnalysis
): string {
  if (analysis.patternStrength === 'weak') {
    return `${character.name} maintains their tactical approach.`;
  }
  
  if (analysis.patternStrength === 'medium') {
    return `${character.name} notices a pattern and adjusts their strategy.`;
  }
  
  // Strong pattern detected
  const spamMoves = analysis.detectedPatterns
    .filter(p => p.isSpam)
    .map(p => p.moveName);
  
  if (spamMoves.length > 0) {
    return `${character.name} recognizes the repeated use of ${spamMoves.join(', ')} and adapts their tactics accordingly.`;
  }
  
  return `${character.name} detects a strong pattern and changes their approach.`;
} 