// CONTEXT: State Tracker
// RESPONSIBILITY: Track narrative state progression and character states

import type { 
  NarrativeState, 
  NarrativeContext, 
  RecentUsageTracker, 
  OneOffTracker 
} from '../types/NarrativeTypes';

/**
 * @description Manages narrative state progression and tracking
 */
export class StateTracker {
  private narrativeStates: Map<string, NarrativeState> = new Map();
  private recentUsage: RecentUsageTracker = {};
  private oneOffTracker: OneOffTracker = {};
  private turnCounters: Map<string, number> = new Map();

  /**
   * @description Initialize tracking for a character
   */
  initializeCharacter(characterName: string): void {
    this.narrativeStates.set(characterName, 'normal');
    this.turnCounters.set(characterName, 0);
    
    if (!this.recentUsage[characterName]) {
      this.recentUsage[characterName] = {};
    }
    
    if (!this.oneOffTracker[characterName]) {
      this.oneOffTracker[characterName] = {};
    }
  }

  /**
   * @description Get current narrative state for character
   */
  getNarrativeState(characterName: string): NarrativeState {
    return this.narrativeStates.get(characterName) || 'normal';
  }

  /**
   * @description Update narrative state based on context
   */
  updateNarrativeState(characterName: string, context: NarrativeContext): void {
    const currentState = this.getNarrativeState(characterName);
    const healthPercentage = (context.health / context.maxHealth) * 100;
    const turnNumber = context.turnNumber;

    let newState: NarrativeState = currentState;

    // State progression logic
    if (context.isEscalation && currentState !== 'escalation') {
      newState = 'escalation';
    } else if (healthPercentage <= 25 && currentState !== 'desperation') {
      newState = 'desperation';
    } else if (context.isPatternBreak && currentState !== 'pattern_break') {
      newState = 'pattern_break';
    } else if (turnNumber >= 15 && currentState === 'normal') {
      newState = 'late_game';
    } else if (healthPercentage <= 10 && currentState !== 'final_gambit') {
      newState = 'final_gambit';
    } else if (context.chi <= 1 && currentState !== 'exhaustion') {
      newState = 'exhaustion';
    }

    this.narrativeStates.set(characterName, newState);
    this.turnCounters.set(characterName, turnNumber);
  }

  /**
   * @description Track recent usage for anti-repetition
   */
  trackUsage(characterName: string, narrativeType: string, line: string): void {
    if (!this.recentUsage[characterName]) {
      this.recentUsage[characterName] = {};
    }
    if (!this.recentUsage[characterName][narrativeType]) {
      this.recentUsage[characterName][narrativeType] = {
        recentLines: [],
        maxRecent: 3,
        lastResetTurn: 0
      };
    }

    const tracker = this.recentUsage[characterName][narrativeType];
    tracker.recentLines.push(line);

    // Keep only recent lines
    if (tracker.recentLines.length > tracker.maxRecent) {
      tracker.recentLines.shift();
    }
  }

  /**
   * @description Check if line was recently used
   */
  isRecentlyUsed(characterName: string, narrativeType: string, line: string): boolean {
    const tracker = this.recentUsage[characterName]?.[narrativeType];
    return tracker?.recentLines.includes(line) || false;
  }

  /**
   * @description Reset usage tracking for a character
   */
  resetUsageTracking(characterName: string, turnNumber: number): void {
    if (this.recentUsage[characterName]) {
      Object.values(this.recentUsage[characterName]).forEach(tracker => {
        tracker.lastResetTurn = turnNumber;
        tracker.recentLines = [];
      });
    }
  }

  /**
   * @description Track one-off moment usage
   */
  trackOneOffMoment(characterName: string, momentType: string, turnNumber: number, context?: string): void {
    if (!this.oneOffTracker[characterName]) {
      this.oneOffTracker[characterName] = {};
    }
    if (!this.oneOffTracker[characterName][momentType]) {
      this.oneOffTracker[characterName][momentType] = {
        used: false,
        turnUsed: undefined,
        context: undefined
      };
    }

    this.oneOffTracker[characterName][momentType] = {
      used: true,
      turnUsed: turnNumber,
      context
    };
  }

  /**
   * @description Check if one-off moment is available
   */
  isOneOffMomentAvailable(characterName: string, momentType: string): boolean {
    const tracker = this.oneOffTracker[characterName]?.[momentType];
    return !tracker?.used;
  }

  /**
   * @description Reset one-off moments for new battle
   */
  resetOneOffMoments(characterName: string): void {
    if (this.oneOffTracker[characterName]) {
      Object.keys(this.oneOffTracker[characterName]).forEach(momentType => {
        this.oneOffTracker[characterName][momentType] = {
          used: false,
          turnUsed: undefined,
          context: undefined
        };
      });
    }
  }

  /**
   * @description Get turn counter for character
   */
  getTurnCounter(characterName: string): number {
    return this.turnCounters.get(characterName) || 0;
  }

  /**
   * @description Reset all tracking for new battle
   */
  resetAllTracking(): void {
    this.narrativeStates.clear();
    this.recentUsage = {};
    this.oneOffTracker = {};
    this.turnCounters.clear();
  }
} 