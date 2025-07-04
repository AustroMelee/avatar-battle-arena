// CONTEXT: Analytics Service
// RESPONSIBILITY: Route analytics requests to appropriate analysis services

import { analyzeBattlePerformance, BattleMetrics } from './battleAnalysis.service';
import { analyzeCharacterPerformance, CharacterMetrics } from './characterAnalysis.service';
import { analyzeAIPerformance, AIMetrics } from './aiAnalysis.service';
import { generateBattleReport } from './reportGenerator.service';

// Re-export the main analysis functions
export { 
  analyzeBattlePerformance, 
  analyzeCharacterPerformance, 
  analyzeAIPerformance,
  generateBattleReport 
};

// Re-export types for backward compatibility
export type { BattleMetrics, CharacterMetrics, AIMetrics }; 