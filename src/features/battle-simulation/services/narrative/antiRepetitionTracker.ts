// Used via dynamic registry in Narrative system. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: Narrative System, // FOCUS: Anti-Repetition Tracking
import type { 
  RecentNarrativeTracker, 
  NarrativeMechanic
} from './types';
import { ANTI_REPETITION_CONFIG } from './types';

/**
 * @description Tracks recent narratives to prevent repetition within a battle
 */
export class AntiRepetitionTracker {
  private tracker: RecentNarrativeTracker = {};
  private currentTurn: number = 0;

  /**
   * @description Updates the current turn number
   */
  updateTurn(turnNumber: number): void {
    this.currentTurn = turnNumber;
    this.cleanupOldEntries();
  }

  /**
   * @description Checks if a narrative line has been used recently for a specific mechanic and character
   */
  isLineRecentlyUsed(
    mechanic: NarrativeMechanic, 
    characterName: string, 
    lineText: string
  ): boolean {
    const characterEntries = this.tracker[mechanic]?.[characterName];
    if (!characterEntries) return false;

    return characterEntries.some(entry => 
      entry.lineText === lineText && 
      this.currentTurn - entry.lastUsed < ANTI_REPETITION_CONFIG.MIN_TURNS_BETWEEN_REPEATS
    );
  }

  /**
   * @description Records a used narrative line
   */
  recordUsedLine(
    mechanic: NarrativeMechanic, 
    characterName: string, 
    lineText: string
  ): void {
    if (!this.tracker[mechanic]) {
      this.tracker[mechanic] = {};
    }
    
    if (!this.tracker[mechanic]![characterName]) {
      this.tracker[mechanic]![characterName] = [];
    }

    const entries = this.tracker[mechanic]![characterName]!;
    entries.push({
      lastUsed: this.currentTurn,
      lineText
    });

    // Keep only the most recent entries
    if (entries.length > ANTI_REPETITION_CONFIG.MAX_RECENT_LINES_PER_MECHANIC) {
      entries.splice(0, entries.length - ANTI_REPETITION_CONFIG.MAX_RECENT_LINES_PER_MECHANIC);
    }
  }

  /**
   * @description Filters out recently used lines from a pool of narrative options
   */
  filterRecentlyUsedLines(
    mechanic: NarrativeMechanic,
    characterName: string,
    availableLines: string[]
  ): string[] {
    return availableLines.filter(line => 
      !this.isLineRecentlyUsed(mechanic, characterName, line)
    );
  }

  /**
   * @description Cleans up old entries that are beyond the reset threshold
   */
  private cleanupOldEntries(): void {
    Object.keys(this.tracker).forEach(mechanicKey => {
      const mechanic = mechanicKey as NarrativeMechanic;
      const characterEntries = this.tracker[mechanic];
      
      if (characterEntries) {
        Object.keys(characterEntries).forEach(characterName => {
          const entries = characterEntries[characterName]!;
          const filteredEntries = entries.filter(entry => 
            this.currentTurn - entry.lastUsed < ANTI_REPETITION_CONFIG.RESET_BUFFER_AFTER_TURNS
          );
          
          if (filteredEntries.length !== entries.length) {
            characterEntries[characterName] = filteredEntries;
          }
        });
      }
    });
  }

  /**
   * @description Resets the tracker for a fresh battle
   */
  reset(): void {
    this.tracker = {};
    this.currentTurn = 0;
  }

  /**
   * @description Gets the current tracker state for debugging
   */
  getTrackerState(): RecentNarrativeTracker {
    return JSON.parse(JSON.stringify(this.tracker));
  }
} 