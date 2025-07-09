/*
 * @file BattleNarrationStrategyService.ts
 * @description Provides strategy logic for selecting and composing narrative lines in the battle simulation.
 * @criticality 🎭 Narrative Strategy
 * @owner AustroMelee
 * @lastUpdated 2025-07-08
 * @related narrative.service.ts, CharacterNarrativeRouter.ts
 */
// CONTEXT: Battle Narration Strategy Service
// RESPONSIBILITY: Choose narrative tracks and strategies based on battle context

import type { NarrativeContext } from '../types/NarrativeTypes';
import { AntiRepetitionTracker } from '../antiRepetitionTracker';

/**
 * @description Service responsible for choosing narrative strategies and tracks
 */
export class BattleNarrationStrategyService {
  private lastTrackUsage: Map<string, number> = new Map();
  private trackCooldowns: Map<string, number> = new Map();
  private antiRepetition: AntiRepetitionTracker = new AntiRepetitionTracker();
  private lastDialogueOrSceneTurn: number = 0;

  constructor() {
    // Initialize track cooldowns
    this.trackCooldowns.set('technical', 2);
    this.trackCooldowns.set('emotional', 1);
    this.trackCooldowns.set('environmental', 3);
  }

  /**
   * @description Choose the appropriate narrative track based on battle context
   */
  chooseNarrativeTrack(turnNumber: number, context: NarrativeContext): 'technical' | 'emotional' | 'environmental' {
    const healthPercentage = (context.health / context.maxHealth) * 100;
    
    // Early game: more technical
    if (turnNumber <= 3) return 'technical';
    
    // Low health: more emotional
    if (healthPercentage <= 25) return 'emotional';
    
    // Critical moments: more emotional
    if (context.isCritical) return 'emotional';
    
    // Pattern breaks: more environmental
    if (context.isPatternBreak) return 'environmental';
    
    // Use enhanced track selector with anti-repetition
    return this.getNarrativeTrackWithAntiRepetition(context);
  }

  /**
   * @description Get narrative track with anti-repetition logic
   */
  private getNarrativeTrackWithAntiRepetition(context: NarrativeContext): 'technical' | 'emotional' | 'environmental' {
    const tracks: Array<'technical' | 'emotional' | 'environmental'> = ['technical', 'emotional', 'environmental'];
    const availableTracks = tracks.filter(track => this.canUseTrack(track, context.turnNumber));
    
    if (availableTracks.length > 0) {
      const selectedTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
      this.lastTrackUsage.set(selectedTrack, context.turnNumber);
      return selectedTrack;
    }
    
    // If all tracks are on cooldown, use the least recently used
    let oldestTrack = tracks[0];
    let oldestTurn = this.lastTrackUsage.get(oldestTrack) || 0;
    
    for (const track of tracks) {
      const lastUsed = this.lastTrackUsage.get(track) || 0;
      if (lastUsed < oldestTurn) {
        oldestTrack = track;
        oldestTurn = lastUsed;
      }
    }
    
    this.lastTrackUsage.set(oldestTrack, context.turnNumber);
    return oldestTrack;
  }

  /**
   * @description Check if a track can be used (not on cooldown)
   */
  private canUseTrack(track: string, turnNumber: number): boolean {
    const lastUsed = this.lastTrackUsage.get(track) || 0;
    const cooldown = this.trackCooldowns.get(track) || 1;
    return turnNumber - lastUsed >= cooldown;
  }

  /**
   * @description Cadence logic: ensure at least one dialogue or scene-setting line every 2 turns in dramatic phases.
   * Dramatic phases: escalation, desperation, climax.
   */
  shouldForceDialogueOrScene(turnNumber: number, phase: 'escalation' | 'desperation' | 'climax' | string): boolean {
    if (phase === 'escalation' || phase === 'desperation' || phase === 'climax') {
      return (turnNumber - this.lastDialogueOrSceneTurn) >= 2;
    }
    // fallback to previous cadence for other phases
    return (turnNumber - this.lastDialogueOrSceneTurn) >= 3;
  }

  /**
   * @description Selects a narrative line with global anti-repetition enforcement.
   * Filters out recently used lines for the given mechanic and character, globally across all phases.
   * If all lines are exhausted, generates a unique contextual line.
   */
  selectNarrativeLine(mechanic: string, characterName: string, availableLines: string[], turnNumber: number): string {
    this.antiRepetition.updateTurn(turnNumber);
    const mechanicKey = mechanic as import('../types').NarrativeMechanic;
    const freshLines = this.antiRepetition.filterRecentlyUsedLines(mechanicKey, characterName, availableLines);
    if (freshLines.length > 0) {
      const chosen = freshLines[Math.floor(Math.random() * freshLines.length)];
      this.antiRepetition.recordUsedLine(mechanicKey, characterName, chosen);
      return chosen;
    }
    // If all lines have been used recently, generate a unique contextual line
    return `[Unique] ${characterName}: ${mechanic} - ${Date.now()}`;
  }

  /**
   * @description Call this when a dialogue or scene-setting line is selected.
   */
  markDialogueOrSceneUsed(turnNumber: number): void {
    this.lastDialogueOrSceneTurn = turnNumber;
  }

  /**
   * @description Determine if escalation narrative should be included
   */
  shouldIncludeEscalation(context: NarrativeContext, lastEscalationTurn: number): boolean {
    const turnNumber = context.turnNumber;
    
    // Only add escalation if it's a meaningful event AND we haven't escalated recently
    // AND only if we haven't used escalation language in the last 5 turns
    return (context.damage >= 20 || context.isCritical || context.isPatternBreak) && 
           turnNumber - lastEscalationTurn >= 5;
  }

  /**
   * @description Determine if desperation narrative should be included
   */
  shouldIncludeDesperation(context: NarrativeContext, lastDesperationTurn: number): boolean {
    const turnNumber = context.turnNumber;
    
    // Avoid repeating desperation too frequently
    return turnNumber - lastDesperationTurn >= 3;
  }

  /**
   * @description Get narrative track using the enhanced selector
   */
  getNarrativeTrack(context: NarrativeContext): 'technical' | 'emotional' | 'environmental' {
    return this.chooseNarrativeTrack(context.turnNumber, context);
  }

  /**
   * @description Reset tracking for new battle
   */
  resetTracking(): void {
    this.lastTrackUsage.clear();
    this.antiRepetition.reset();
    this.lastDialogueOrSceneTurn = 0;
  }
} 