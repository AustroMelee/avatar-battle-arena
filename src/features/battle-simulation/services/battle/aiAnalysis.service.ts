// CONTEXT: AI Analysis Service
// RESPONSIBILITY: Analyze AI performance metrics

import { BattleLogEntry, AILogEntry } from '../../types';

/**
 * @description Represents AI performance metrics.
 */
export interface AIMetrics {
  patternRecognitionAccuracy: number;
  antiSpamEffectiveness: number;
  adaptationSpeed: number;
  decisionQuality: number;
  reasoningDiversity: number;
}

/**
 * @description Analyzes AI performance metrics from battle and AI logs.
 * @param {BattleLogEntry[]} battleLog - The battle log.
 * @param {AILogEntry[]} aiLog - The AI decision log.
 * @returns {AIMetrics} AI performance metrics.
 */
export function analyzeAIPerformance(
  battleLog: BattleLogEntry[],
  aiLog: AILogEntry[]
): AIMetrics {
  // Calculate pattern recognition accuracy
  const patternAdaptations = battleLog.filter(entry => 
    entry.meta?.aiRule?.includes('Anti-pattern')
  ).length;
  const totalAIInterventions = aiLog.filter(entry => 
    entry.reasoning?.includes('pattern') || entry.reasoning?.includes('spam')
  ).length;
  const patternRecognitionAccuracy = totalAIInterventions > 0 ? 
    patternAdaptations / totalAIInterventions : 0;
  
  // Calculate anti-spam effectiveness
  const spamPreventions = battleLog.filter(entry => 
    entry.meta?.aiRule?.includes('Anti-spam')
  ).length;
  const totalSpamAttempts = aiLog.filter(entry => 
    entry.reasoning?.includes('spam') || entry.reasoning?.includes('repetition')
  ).length;
  const antiSpamEffectiveness = totalSpamAttempts > 0 ? 
    spamPreventions / totalSpamAttempts : 0;
  
  // Calculate adaptation speed (turns between adaptations)
  const adaptationTurns = aiLog
    .filter(entry => entry.reasoning?.includes('adapt'))
    .map(entry => entry.turn)
    .sort((a, b) => a - b);
  
  let adaptationSpeed = 0;
  if (adaptationTurns.length > 1) {
    const intervals = [];
    for (let i = 1; i < adaptationTurns.length; i++) {
      intervals.push(adaptationTurns[i] - adaptationTurns[i - 1]);
    }
    adaptationSpeed = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  }
  
  // Calculate decision quality (successful vs failed adaptations)
  const successfulAdaptations = battleLog.filter(entry => 
    entry.meta?.aiRule && entry.damage && entry.damage > 0
  ).length;
  const totalAdaptations = battleLog.filter(entry => 
    entry.meta?.aiRule
  ).length;
  const decisionQuality = totalAdaptations > 0 ? 
    successfulAdaptations / totalAdaptations : 0;
  
  // Calculate reasoning diversity (unique reasoning patterns)
  const uniqueReasonings = new Set(
    aiLog
      .filter(entry => entry.reasoning)
      .map(entry => {
        const reasoning = entry.reasoning.toLowerCase();
        if (reasoning.includes('pattern')) return 'pattern';
        if (reasoning.includes('spam')) return 'spam';
        if (reasoning.includes('desperation')) return 'desperation';
        if (reasoning.includes('finisher')) return 'finisher';
        if (reasoning.includes('position')) return 'position';
        if (reasoning.includes('charge')) return 'charge';
        return 'other';
      })
  );
  const reasoningDiversity = uniqueReasonings.size / 6; // Normalize to 0-1 scale
  
  return {
    patternRecognitionAccuracy,
    antiSpamEffectiveness,
    adaptationSpeed,
    decisionQuality,
    reasoningDiversity
  };
} 