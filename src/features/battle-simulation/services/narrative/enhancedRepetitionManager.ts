// Used via dynamic registry in Narrative engine. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: Narrative System, // FOCUS: Enhanced Repetition Management
import type { NarrativeMechanic } from './types';

/**
 * @description Tracks narrative tokens to prevent repetition and enable sophisticated rotation
 */
export type NarrativeToken = {
  text: string;
  turnUsed: number;
  character: string;
  mechanic: NarrativeMechanic;
  intensity: 'low' | 'medium' | 'high';
};

/**
 * @description Enhanced repetition manager with token tracking and state-aware rotation
 */
export class EnhancedRepetitionManager {
  private recentTokens: NarrativeToken[] = [];
  private stateCounters: Record<string, number> = {};
  private maxTokens: number = 5;
  private suppressionTurns: number = 3;

  /**
   * @description Updates the current turn and cleans up old tokens
   */
  updateTurn(turnNumber: number): void {
    // Remove tokens older than suppressionTurns
    this.recentTokens = this.recentTokens.filter(
      token => turnNumber - token.turnUsed < this.suppressionTurns
    );
  }

  /**
   * @description Records a used narrative token
   */
  recordToken(
    text: string,
    character: string,
    mechanic: NarrativeMechanic,
    turnNumber: number,
    intensity: 'low' | 'medium' | 'high' = 'medium'
  ): void {
    this.recentTokens.push({
      text,
      turnUsed: turnNumber,
      character,
      mechanic,
      intensity
    });

    // Keep only the most recent tokens
    if (this.recentTokens.length > this.maxTokens) {
      this.recentTokens = this.recentTokens.slice(-this.maxTokens);
    }

    // Update state counter
    const stateKey = `${character}_${mechanic}`;
    this.stateCounters[stateKey] = (this.stateCounters[stateKey] || 0) + 1;
  }

  /**
   * @description Checks if a narrative line has been used recently
   */
  isRecentlyUsed(
    text: string,
    character: string,
    mechanic: NarrativeMechanic
  ): boolean {
    return this.recentTokens.some(token => 
      token.text === text && 
      token.character === character && 
      token.mechanic === mechanic
    );
  }

  /**
   * @description Gets the count of times a state has been triggered
   */
  getStateCount(character: string, mechanic: NarrativeMechanic): number {
    const stateKey = `${character}_${mechanic}`;
    return this.stateCounters[stateKey] || 0;
  }

  /**
   * @description Filters out recently used lines and returns available options
   */
  filterRecentlyUsedLines(
    lines: string[],
    character: string,
    mechanic: NarrativeMechanic
  ): string[] {
    return lines.filter(line => 
      !this.isRecentlyUsed(line, character, mechanic)
    );
  }

  /**
   * @description Gets a state-appropriate line based on count
   */
  getStateAppropriateLine(
    lines: string[],
    character: string,
    mechanic: NarrativeMechanic
  ): string {
    const count = this.getStateCount(character, mechanic);
    
    // If we have enough lines, use count-based selection
    if (lines.length >= 3) {
      const index = count % lines.length;
      return lines[index];
    }
    
    // Otherwise, filter and select randomly
    const availableLines = this.filterRecentlyUsedLines(lines, character, mechanic);
    if (availableLines.length > 0) {
      return availableLines[Math.floor(Math.random() * availableLines.length)];
    }
    
    // If all lines are recently used, allow repeats
    return lines[Math.floor(Math.random() * lines.length)];
  }

  /**
   * @description Resets the repetition manager for a new battle
   */
  reset(): void {
    this.recentTokens = [];
    this.stateCounters = {};
  }

  /**
   * @description Gets the current state for debugging
   */
  getState(): {
    recentTokens: NarrativeToken[];
    stateCounters: Record<string, number>;
  } {
    return {
      recentTokens: [...this.recentTokens],
      stateCounters: { ...this.stateCounters }
    };
  }
} 