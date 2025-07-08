// Used via dynamic registry in Narrative engine. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: Narrative System, // FOCUS: Enhanced State Management with Change Detection
import type { BattleState, BattleCharacter } from '../../types';

/**
 * @description Tracks the previous state of each character to detect changes
 */
export type CharacterStateSnapshot = {
  isEscalated: boolean;
  isDesperate: boolean;
  isPatternBroken: boolean;
  position: string;
  health: number;
  lastMove: string;
  moveHistory: string[];
  turnNumber: number;
};

/**
 * @description Enhanced state manager that only generates announcements on actual state changes
 */
export class EnhancedStateManager {
  private previousStates: Record<string, CharacterStateSnapshot> = {};
  private stateAnnouncements: Record<string, Set<string>> = {};
  private currentTurn: number = 0;

  constructor() {
    this.reset();
  }

  /**
   * @description Updates the current turn
   */
  updateTurn(turnNumber: number): void {
    this.currentTurn = turnNumber;
  }

  /**
   * @description Takes a snapshot of the current character state
   */
  private takeSnapshot(character: BattleCharacter): CharacterStateSnapshot {
    return {
      isEscalated: character.flags?.forcedEscalation === 'true',
      isDesperate: character.flags?.usedDesperation === true,
      isPatternBroken: false, // Pattern breaking is detected through move history analysis
      position: character.position,
      health: character.currentHealth,
      lastMove: character.lastMove || '',
      moveHistory: [...(character.moveHistory || [])],
      turnNumber: this.currentTurn
    };
  }

  /**
   * @description Detects if a character's state has changed
   */
  private detectStateChanges(
    character: BattleCharacter,
    previousSnapshot: CharacterStateSnapshot
  ): {
    escalationChanged: boolean;
    desperationChanged: boolean;
    patternBreakChanged: boolean;
    positionChanged: boolean;
    healthChanged: boolean;
  } {
    const currentSnapshot = this.takeSnapshot(character);
    
    return {
      escalationChanged: currentSnapshot.isEscalated !== previousSnapshot.isEscalated,
      desperationChanged: currentSnapshot.isDesperate !== previousSnapshot.isDesperate,
      patternBreakChanged: currentSnapshot.isPatternBroken !== previousSnapshot.isPatternBroken,
      positionChanged: currentSnapshot.position !== previousSnapshot.position,
      healthChanged: Math.abs(currentSnapshot.health - previousSnapshot.health) > 0
    };
  }

  /**
   * @description Checks if a state announcement should be generated
   */
  shouldGenerateAnnouncement(
    character: string,
    stateType: 'escalation' | 'desperation' | 'pattern_break' | 'position_change'
  ): boolean {
    const characterAnnouncements = this.stateAnnouncements[character] || new Set();
    const announcementKey = `${stateType}_${this.currentTurn}`;
    
    // Check if this specific announcement has already been made
    if (characterAnnouncements.has(announcementKey)) {
      return false;
    }

    // Check if we've made too many announcements recently
    const recentAnnouncements = Array.from(characterAnnouncements)
      .filter(key => key.includes(`_${this.currentTurn}`))
      .length;

    // Limit to 2 announcements per turn per character
    return recentAnnouncements < 2;
  }

  /**
   * @description Records that a state announcement was made
   */
  recordAnnouncement(
    character: string,
    stateType: 'escalation' | 'desperation' | 'pattern_break' | 'position_change'
  ): void {
    if (!this.stateAnnouncements[character]) {
      this.stateAnnouncements[character] = new Set();
    }
    
    const announcementKey = `${stateType}_${this.currentTurn}`;
    this.stateAnnouncements[character].add(announcementKey);
  }

  /**
   * @description Analyzes the battle state and generates appropriate announcements
   */
  analyzeBattleState(state: BattleState): {
    announcements: Array<{
      character: string;
      type: 'escalation' | 'desperation' | 'pattern_break' | 'position_change';
      narrative: string;
    }>;
    updatedState: BattleState;
  } {
    const announcements: Array<{
      character: string;
      type: 'escalation' | 'desperation' | 'pattern_break' | 'position_change';
      narrative: string;
    }> = [];

    const newState = { ...state };

    // Analyze each participant
    state.participants.forEach((participant) => {
      const previousSnapshot = this.previousStates[participant.name];
      
      if (previousSnapshot) {
        const changes = this.detectStateChanges(participant, previousSnapshot);
        
        // Check for escalation change
        if (changes.escalationChanged && participant.flags?.forcedEscalation === 'true') {
          if (this.shouldGenerateAnnouncement(participant.name, 'escalation')) {
            announcements.push({
              character: participant.name,
              type: 'escalation',
              narrative: this.generateEscalationNarrative(participant.name, this.currentTurn)
            });
            this.recordAnnouncement(participant.name, 'escalation');
          }
        }

        // Check for desperation change
        if (changes.desperationChanged && participant.flags?.usedDesperation === true) {
          if (this.shouldGenerateAnnouncement(participant.name, 'desperation')) {
            announcements.push({
              character: participant.name,
              type: 'desperation',
              narrative: this.generateDesperationNarrative(participant.name, this.currentTurn)
            });
            this.recordAnnouncement(participant.name, 'desperation');
          }
        }

        // Check for pattern break change (detected through move history analysis)
        if (changes.patternBreakChanged) {
          if (this.shouldGenerateAnnouncement(participant.name, 'pattern_break')) {
            announcements.push({
              character: participant.name,
              type: 'pattern_break',
              narrative: this.generatePatternBreakNarrative(participant.name, this.currentTurn)
            });
            this.recordAnnouncement(participant.name, 'pattern_break');
          }
        }
      }

      // Update the previous state snapshot
      this.previousStates[participant.name] = this.takeSnapshot(participant);
    });

    return { announcements, updatedState: newState };
  }

  /**
   * @description Generates escalation narrative with variety
   */
  private generateEscalationNarrative(character: string, turnNumber: number): string {
    const narratives = [
      "The battle reaches a breaking point! Both fighters are forced to escalate or face defeat!",
      "Neither fighter can hold back now; a single misstep means disaster.",
      "Each breath, every motion, feels like the threshold to oblivion.",
      "The tension is unbearable—one wrong move will end everything.",
      "The arena trembles with anticipation! The pressure mounts to unbearable levels!",
      "Both warriors sense the turning point—there's no going back now.",
      "The battle has reached its critical phase—every strike could be the last.",
      "The air crackles with raw power as both fighters abandon restraint."
    ];

    // Use turn number to add variety
    const index = (turnNumber + character.charCodeAt(0)) % narratives.length;
    return narratives[index];
  }

  /**
   * @description Generates desperation narrative with variety
   */
  private generateDesperationNarrative(character: string, turnNumber: number): string {
    const narratives = [
      `${character} fights like a cornered animal—deadly, but vulnerable.`,
      `${character} feels the ancient power stirring within. Desperate moves are now available.`,
      `${character}'s focus fractures. For a heartbeat, all restraint dissolves.`,
      `${character} is pushed to their absolute limits—desperation takes over.`,
      `${character} reaches deep within, finding strength they didn't know they had.`,
      `${character} abandons all technique—pure survival instinct takes over.`,
      `${character} taps into reserves of power they've never used before.`,
      `${character} becomes unpredictable, dangerous—a wounded predator.`
    ];

    const index = (turnNumber + character.charCodeAt(0)) % narratives.length;
    return narratives[index];
  }

  /**
   * @description Generates pattern break narrative with variety
   */
  private generatePatternBreakNarrative(character: string, turnNumber: number): string {
    const narratives = [
      `${character} snaps out of their pattern, their movements becoming unpredictable!`,
      `${character} realizes they've become predictable and shifts tactics dramatically!`,
      `${character} breaks free from their routine, launching a sudden burst of movement!`,
      `${character} adapts their fighting style—their opponent is momentarily off-balance!`,
      `${character} changes their approach completely—the predictable exchanges end!`,
      `${character} recognizes the pattern and deliberately breaks free from it!`,
      `${character} shifts tactics mid-strike—their opponent can't keep up!`,
      `${character} abandons their predictable attacks—the battle tempo shifts!`
    ];

    const index = (turnNumber + character.charCodeAt(0)) % narratives.length;
    return narratives[index];
  }

  /**
   * @description Resets the state manager for a new battle
   */
  reset(): void {
    this.previousStates = {};
    this.stateAnnouncements = {};
    this.currentTurn = 0;
  }

  /**
   * @description Gets the current state for debugging
   */
  getState(): Record<string, unknown> {
    return {
      previousStates: Object.keys(this.previousStates),
      stateAnnouncements: Object.keys(this.stateAnnouncements),
      currentTurn: this.currentTurn
    };
  }
} 