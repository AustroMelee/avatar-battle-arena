// CONTEXT: Battle Simulation Orchestrator
// RESPONSIBILITY: Orchestrate the battle simulation using modular services
import { SimulateBattleParams, BattleState, BattleLogEntry, AILogEntry } from '../types';
import { createInitialBattleState, cloneBattleState } from './battle/state';
import { processTurn } from './battle/processTurn';
import { analyzeBattlePerformance, analyzeCharacterPerformance, analyzeAIPerformance, generateBattleReport, BattleMetrics, CharacterMetrics, AIMetrics } from './battle/analytics';
import { initializeAnalyticsTracker, processLogEntryForAnalytics } from './battle/analyticsTracker.service';
import { generateUniqueLogId } from './ai/logQueries';

/**
 * @description Represents the result of a battle simulation with analytics.
 */
export interface BattleSimulationResult {
  finalState: BattleState;
  battleLog: BattleLogEntry[];
  aiLog: AILogEntry[];
  analytics: {
    battleMetrics: BattleMetrics;
    characterMetrics: CharacterMetrics[];
    aiMetrics: AIMetrics;
    report: string;
    realTime: any;
  };
  duration: number;
}

/**
 * @description Battle simulator service configuration
 */
interface BattleSimulatorConfig {
  realTime: boolean;
  maxTurns: number;
  timeoutMs: number;
}

/**
 * @description Battle simulator service
 */
export class BattleSimulator {
  private config: BattleSimulatorConfig;

  constructor(config: BattleSimulatorConfig = { realTime: false, maxTurns: 50, timeoutMs: 30000 }) {
    this.config = config;
  }

  /**
   * @description Simulates a complete battle between two characters with comprehensive analytics.
   * @param {SimulateBattleParams} params - The battle parameters.
   * @returns {BattleSimulationResult} The complete battle result with analytics.
   */
  async simulateBattle(params: SimulateBattleParams): Promise<BattleSimulationResult> {
    const startTime = Date.now();
    
    // Initialize battle state
    let currentState = createInitialBattleState(params);
    const maxTurns = 50; // Prevent infinite battles
    
    // Initialize analytics
    let analytics = initializeAnalyticsTracker();
    
    // Track analytics during battle
    const trackAnalytics = (logEntry: BattleLogEntry) => {
      analytics = processLogEntryForAnalytics(analytics, logEntry);
    };
    
    // Simulate battle turns
    while (!currentState.isFinished && currentState.turn < maxTurns) {
      const previousState = cloneBattleState(currentState);
      currentState = await processTurn(currentState);
      
      // Track new log entries for analytics
      const newEntries = currentState.battleLog.slice(previousState.battleLog.length);
      newEntries.forEach(trackAnalytics);
    }
    
    // Force battle end if max turns reached
    if (currentState.turn >= maxTurns && !currentState.isFinished) {
      currentState.isFinished = true;
      currentState.winner = null; // Draw
      currentState.battleLog.push({
        id: generateUniqueLogId('turn'),
        turn: currentState.turn,
        actor: 'System',
        type: 'DRAW',
        action: 'max_turns',
        result: 'Battle ended due to maximum turns reached.',
        narrative: 'The battle has dragged on too long. Both warriors are exhausted.',
        timestamp: Date.now(),
        meta: { resolution: 'max_turns' }
      });
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Generate comprehensive analytics
    const battleMetrics = analyzeBattlePerformance(currentState, currentState.battleLog, startTime);
    const characterMetrics = currentState.participants.map(character => 
      analyzeCharacterPerformance(character, currentState.battleLog)
    );
    const aiMetrics = analyzeAIPerformance(currentState.battleLog, currentState.aiLog);
    const report = generateBattleReport(battleMetrics, characterMetrics, aiMetrics);
    
    // Log analytics summary
    console.log('=== BATTLE ANALYTICS SUMMARY ===');
    console.log(`Duration: ${Math.round(duration / 1000)}s`);
    console.log(`Turns: ${battleMetrics.totalTurns}`);
    console.log(`Winner: ${battleMetrics.winner || 'Draw'}`);
    console.log(`Victory Method: ${battleMetrics.victoryMethod}`);
    console.log(`Total Damage: ${battleMetrics.totalDamage}`);
    console.log(`Chi Efficiency: ${battleMetrics.chiEfficiency.toFixed(2)}`);
    console.log(`Desperation Moves: ${battleMetrics.desperationMoves}`);
    console.log(`Pattern Adaptations: ${battleMetrics.patternAdaptations}`);
    console.log(`Stalemate Prevention: ${battleMetrics.stalematePrevention ? 'Yes' : 'No'}`);
    console.log('================================');
    
    return {
      finalState: currentState,
      battleLog: currentState.battleLog,
      aiLog: currentState.aiLog,
      analytics: {
        battleMetrics,
        characterMetrics,
        aiMetrics,
        report,
        realTime: analytics
      },
      duration
    };
  }
}

/**
 * @description Simulates a complete battle between two characters.
 * @param {SimulateBattleParams} params - Battle simulation parameters.
 * @returns {BattleSimulationResult} The complete battle result with analytics.
 */
export async function simulateBattle(params: SimulateBattleParams): Promise<BattleSimulationResult> {
  const simulator = new BattleSimulator();
  return await simulator.simulateBattle(params);
} 