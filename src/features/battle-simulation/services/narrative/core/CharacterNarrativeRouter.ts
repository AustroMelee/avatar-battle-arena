/*
 * @file CharacterNarrativeRouter.ts
 * @description Routes narrative line selection for specific characters in the battle simulation.
 * @criticality 🎭 Narrative Routing
 * @owner AustroMelee
 * @lastUpdated 2025-07-08
 * @related narrative.service.ts, BattleNarrationStrategyService.ts
 */
// CONTEXT: Character Narrative Router
// RESPONSIBILITY: Route narrative requests to character-specific services only

import { AangNarrativeService } from './characters/AangNarrativeService';
import { AzulaNarrativeService } from './characters/AzulaNarrativeService';
import { NarrativeMemoryManager } from './NarrativeMemoryManager';
import { EmotionalArcTracker } from './EmotionalArcTracker';
import type { NarrativeContext } from '../types/NarrativeTypes';

/**
 * @description Router service that delegates to character-specific narrative services only
 */
export class CharacterNarrativeRouter {
  private aangService: AangNarrativeService;
  private azulaService: AzulaNarrativeService;
  private memoryManager: NarrativeMemoryManager;
  private arcTracker: EmotionalArcTracker;
  private turnNumber: number = 0;

  constructor() {
    this.aangService = new AangNarrativeService();
    this.azulaService = new AzulaNarrativeService();
    this.memoryManager = new NarrativeMemoryManager();
    this.arcTracker = new EmotionalArcTracker();
  }

  /**
   * @description Initialize character tracking
   */
  initializeCharacter(characterName: string): void {
    this.memoryManager.initializeCharacter(characterName);
    this.arcTracker.initializeCharacter(characterName);
    if (characterName.toLowerCase().includes('aang')) {
      this.aangService.initialize();
    } else if (characterName.toLowerCase().includes('azula')) {
      this.azulaService.initialize();
    }
  }

  /**
   * @description Update turn number
   */
  updateTurn(turnNumber: number): void {
    this.turnNumber = turnNumber;
    this.memoryManager.setTurn(turnNumber);
    this.arcTracker.setTurn(turnNumber);
  }

  /**
   * @description Get character-specific miss line
   */
  getMissLine(characterName: string): string {
    if (characterName.toLowerCase().includes('aang')) {
      return this.aangService.getMissLine();
    } else if (characterName.toLowerCase().includes('azula')) {
      return this.azulaService.getMissLine();
    }
    return "The attack misses its mark.";
  }

  /**
   * @description Get character-specific hit line
   */
  getHitLine(characterName: string): string {
    if (characterName.toLowerCase().includes('aang')) {
      return this.aangService.getHitLine();
    } else if (characterName.toLowerCase().includes('azula')) {
      return this.azulaService.getHitLine();
    }
    return "The attack connects with solid force.";
  }

  /**
   * @description Get move-specific flavor for character
   */
  getMoveFlavor(characterName: string, moveName: string, damageOutcome: string): string | null {
    if (characterName.toLowerCase().includes('aang')) {
      const flavor = this.aangService.getMoveFlavor(moveName, damageOutcome);
      if (flavor) {
        return flavor;
      }
    } else if (characterName.toLowerCase().includes('azula')) {
      const flavor = this.azulaService.getMoveFlavor(moveName);
      if (flavor) {
        return flavor;
      }
    }
    return null;
  }

  /**
   * @description Get escalation line with strict timing and phase-based selection
   */
  getEscalationLine(characterName: string, context: NarrativeContext): string | null {
    // Only escalate if enough turns have passed AND it's a meaningful event
    const isSignificant = context.damage >= 20 || context.isCritical || context.isPatternBreak || 
                         context.health <= 30 || this.turnNumber >= 15;
    if (!isSignificant) return null;
    
    if (characterName.toLowerCase().includes('aang')) {
      return this.aangService.getEscalationLine(context);
    } else if (characterName.toLowerCase().includes('azula')) {
      return this.azulaService.getEscalationLine(context);
    }
    return null;
  }

  /**
   * @description Get defeat line
   */
  getDefeatLine(characterName: string): string {
    if (characterName.toLowerCase().includes('aang')) {
      return this.aangService.getDefeatLine();
    } else if (characterName.toLowerCase().includes('azula')) {
      return this.azulaService.getDefeatLine();
    }
    return "Defeat is suffered.";
  }

  /**
   * @description Update emotional state and character arc
   */
  updateEmotionalState(characterName: string, event: string, damage: number, healthPercentage: number): void {
    this.arcTracker.updateArc(characterName, event, healthPercentage);
    if (characterName.toLowerCase().includes('aang')) {
      this.aangService.updateEmotionalState(event, damage);
    } else if (characterName.toLowerCase().includes('azula')) {
      this.azulaService.updateEmotionalState(event);
    }
  }

  /**
   * @description Get emotional state for character
   */
  getEmotionalState(characterName: string): { composure?: number; control?: number; resolve?: number } {
    if (characterName.toLowerCase().includes('aang')) {
      const aangState = this.aangService.getEmotionalState();
      return { resolve: aangState.resolve, composure: aangState.determination };
    } else if (characterName.toLowerCase().includes('azula')) {
      const azulaState = this.azulaService.getEmotionalState();
      return { composure: azulaState.composure, control: azulaState.control };
    }
    return { resolve: 0, composure: 0 };
  }

  /**
   * @description Reset all tracking for new battle
   */
  resetForNewBattle(): void {
    this.memoryManager.reset();
    this.arcTracker.reset();
    this.turnNumber = 0;
    this.aangService.initialize();
    this.azulaService.initialize();
  }

  /**
   * @description Get current battle phase
   */
  getBattlePhase(characterName: string): string {
    return this.arcTracker.getCurrentPhase(characterName);
  }

  /**
   * @description Get character arc information
   */
  getCharacterArc(characterName: string): { currentPhase: string; lastPhaseChange: number; emotionalProgression: number; hasSnapped: boolean } | null {
    return this.arcTracker.getArc(characterName);
  }

  /**
   * @description Get victory line for a character
   */
  getVictoryLine(characterName: string): string {
    return `${characterName} is victorious!`;
  }
} 