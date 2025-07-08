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
import { NarrativePoolRegistry } from '../pools/narrativePoolRegistry.service';
import { moveNameToMechanicKey } from '../utils/narrativeKey.utility';
import type { CombatMechanic } from '../narrative.types';

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
    return [
      "The attack slips harmlessly through the air—both fighters read each other perfectly.",
      "A flurry of motion, but the strike never finds its mark—skill and nerves cancel each other.",
      "Missed! The arena echoes with the sound of wind, not pain.",
      "A wild feint—an artful dodge—no contact, only anticipation.",
      "Momentum stalls as the move fails, tension twisting tighter.",
      "Both warriors move like shadows; the attack dissipates before it can matter."
    ][Math.floor(Math.random() * 6)];
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
    return [
      "A punishing blow lands, shifting the rhythm of battle.",
      "The strike crashes home—pain flares, and focus wavers.",
      "A perfectly timed attack shakes the defender’s resolve.",
      "The move finds its mark—a sudden gasp from the crowd.",
      "Flesh and spirit reel from the impact, the duel turning more desperate.",
      "A jarring hit leaves one fighter staggered, eyes wide with surprise."
    ][Math.floor(Math.random() * 6)];
  }

  /**
   * @description Get move-specific flavor for a character.
   * This is now plug-and-play for any new character.
   */
  getMoveFlavor(characterName: string, moveName: string, damageOutcome: string): string | null {
    // DEBUG: Print every call to getMoveFlavor
    const mechanicKey = moveNameToMechanicKey(moveName);
    console.log('CHARACTER NARRATIVE ROUTER CALL:', { characterName, moveName, mechanicKey, damageOutcome });

    // FORCE: If Zuko/FireWhip, always return the custom line
    if (characterName.toLowerCase() === 'zuko' && mechanicKey === ('FireWhip' as CombatMechanic)) {
      console.log('FORCED ZUKO FIRE WHIP NARRATIVE TRIGGERED');
      return "Zuko's fire whip cracks across the field!";
    }

    // 1. Handle special-cased characters (legacy or highly custom logic)
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

    // 2. Generic "Plug-and-Play" Fallback for ALL other characters (including Zuko)
    try {
      const mechanicKey = moveNameToMechanicKey(moveName);
      const narrativePool = NarrativePoolRegistry.getPool(characterName);
      // Check for a valid context (hit, miss, etc.)
      const validContext = ['hit', 'miss', 'victory', 'chargeStart', 'trigger', 'apply'].includes(damageOutcome) ? damageOutcome : 'hit';
      let lines = narrativePool?.[mechanicKey]?.[validContext as keyof typeof narrativePool[typeof mechanicKey]] as string[] | undefined;
      // Fallback: If no lines for the context, try 'hit'
      if ((!lines || lines.length === 0) && validContext !== 'hit') {
        lines = narrativePool?.[mechanicKey]?.['hit' as keyof typeof narrativePool[typeof mechanicKey]] as string[] | undefined;
      }
      // DEBUG: Print plug-and-play narrative pool lookup for all characters
      console.log('PLUG-AND-PLAY NARRATIVE POOL LOOKUP:', { characterName, mechanicKey, validContext, lines });
      if (lines && lines.length > 0) {
        // Return a random line from the found pool
        return lines[Math.floor(Math.random() * lines.length)];
      }
    } catch (error) {
      console.error(`Error fetching narrative for ${characterName}/${moveName}:`, error);
      return null;
    }
    
    // 3. If no specific narrative is found, return a rich generic move description.
    const genericMoves = [
      `A burst of energy—${moveName} flashes in the chaos of battle.`,
      `With fierce resolve, a ${moveName} cuts through the tension.`,
      `A sudden lunge—a risky ${moveName} seeking weakness.`,
      `Instinct takes over; ${moveName} arcs with raw intent.`,
      `Desperation transforms into movement—${moveName} unleashed.`,
      `A calculated gamble: ${moveName} lands with consequences yet unknown.`
    ];
    return genericMoves[Math.floor(Math.random() * genericMoves.length)];
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
    return [
      "The light fades from their eyes as defeat settles over the arena—lesson, not victory, is all that remains.",
      "Collapse comes swift and final—a story written in sweat and failure.",
      "A last desperate stand crumbles, their strength lost to exhaustion and fate.",
      "Defeat is a silent companion, settling on tired shoulders.",
      "Their knees touch the ground, but the spirit learns in falling.",
      "A hard-fought duel ends not in triumph, but in wisdom’s painful sting."
    ][Math.floor(Math.random() * 6)];
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
    return [
      `${characterName} stands triumphant, their will etched into the very stones of the arena.`,
      `Victory is written in sweat and scars—${characterName} claims the day.`,
      `Against all odds, ${characterName} rises, the roar of the crowd like thunder.`,
      `The world holds its breath as ${characterName} basks in hard-won triumph.`,
      `${characterName} has overcome adversity—legend grows in the telling of this moment.`,
      `No doubt remains—${characterName}'s name is carved into the story of the age.`
    ][Math.floor(Math.random() * 6)];
  }
} 