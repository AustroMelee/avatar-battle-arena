// CONTEXT: Narrative Composer
// RESPONSIBILITY: Compose narrative lines from fragments and components

import type { DamageOutcome, NarrativeMemoryEntry } from '../types/NarrativeTypes';
import { CharacterNarrativeRouter } from './CharacterNarrativeRouter';
import { NarrativeVariantsService } from './NarrativeVariantsService';

/**
 * @description Service responsible for composing narrative lines from various components
 */
export class NarrativeComposer {
  private characterRouter: CharacterNarrativeRouter;
  private variantsService: NarrativeVariantsService;

  constructor(
    characterRouter: CharacterNarrativeRouter,
    variantsService: NarrativeVariantsService
  ) {
    this.characterRouter = characterRouter;
    this.variantsService = variantsService;
  }

  /**
   * @description Compose technical narrative focusing on move execution. Now supports multi-part output.
   * @returns A string or array of narrative lines (e.g., [intention, action, reaction])
   */
  composeTechnicalNarrative(
    characterName: string,
    damageOutcome: DamageOutcome,
    moveName: string,
    memory: NarrativeMemoryEntry[]
  ): string | string[] {
    // Check for recent memory (last 3 turns)
    const recent = memory.filter(e => ['dodge','critical_hit','reversal','one_off_moment'].includes(e.type));
    let memoryLine = '';
    if (recent.length > 0) {
      const last = recent[recent.length - 1];
      memoryLine = `${characterName} remembers their recent ${last.type.replace('_',' ')}${last.move ? ` (${last.move})` : ''}.`;
    }
    // Try to get move-specific flavor first
    const moveFlavor = this.characterRouter.getMoveFlavor(characterName, moveName, damageOutcome);
    if (moveFlavor) {
      const base = [
        `${characterName} prepares to use ${moveName}.`,
        moveFlavor
      ];
      return memoryLine ? [memoryLine, ...base] : base;
    }
    // Fall back to character-specific lines
    if (damageOutcome === 'miss') {
      const base = [
        `${characterName} attempts a move, but it misses.`,
        this.characterRouter.getMissLine(characterName)
      ];
      return memoryLine ? [memoryLine, ...base] : base;
    } else if (damageOutcome === 'hit') {
      const base = [
        `${characterName} strikes decisively.`,
        this.characterRouter.getHitLine(characterName)
      ];
      return memoryLine ? [memoryLine, ...base] : base;
    } else {
      const base = this.variantsService.getDamageOutcomeVariant(damageOutcome);
      return memoryLine ? [memoryLine, ...(Array.isArray(base) ? base : [base])] : base;
    }
  }

  /**
   * @description Compose emotional narrative with state tracking. Now supports multi-part output.
   * @returns A string or array of narrative lines (e.g., [intention, action, reaction])
   */
  composeEmotionalNarrative(
    characterName: string,
    damageOutcome: DamageOutcome,
    moveName: string,
    emotionalState: string,
    shouldNarrateEmotion: boolean,
    emotionalEnhancement: string,
    memory: NarrativeMemoryEntry[]
  ): string | string[] {
    // Check for recent memory (last 3 turns)
    const recent = memory.filter(e => ['dodge','critical_hit','reversal','one_off_moment'].includes(e.type));
    let memoryLine = '';
    if (recent.length > 0) {
      const last = recent[recent.length - 1];
      memoryLine = `${characterName} recalls their recent ${last.type.replace('_',' ')}${last.move ? ` (${last.move})` : ''}.`;
    }
    // Get move-specific flavor if available (directly from router)
    const moveFlavor = this.characterRouter.getMoveFlavor(characterName, moveName, damageOutcome);
    if (moveFlavor) {
      if (shouldNarrateEmotion) {
        const base = [
          `${characterName} feels ${emotionalState} as the moment unfolds.`,
          moveFlavor,
          emotionalEnhancement
        ];
        return memoryLine ? [memoryLine, ...base] : base;
      }
      return memoryLine ? [memoryLine, moveFlavor] : moveFlavor;
    }
    // Fallback to standard emotional narrative with enhanced emotional state selection
    const baseLine = this.getEmotionallyAppropriateLine(characterName, damageOutcome, emotionalState);
    if (shouldNarrateEmotion) {
      const base = [
        `${characterName} feels ${emotionalState}.`,
        baseLine,
        emotionalEnhancement
      ];
      return memoryLine ? [memoryLine, ...base] : base;
    }
    return memoryLine ? [memoryLine, baseLine] : baseLine;
  }

  /**
   * @description Get emotionally appropriate line based on character and emotional state
   */
  private getEmotionallyAppropriateLine(characterName: string, damageOutcome: DamageOutcome, emotionalState: string): string {
    if (characterName.toLowerCase().includes('aang')) {
      return this.getAangEmotionalLine(damageOutcome, emotionalState);
    } else if (characterName.toLowerCase().includes('azula')) {
      return this.getAzulaEmotionalLine(damageOutcome, emotionalState);
    }
    
    // Fallback to standard lines
    return damageOutcome === 'miss' 
      ? this.characterRouter.getMissLine(characterName)
      : this.characterRouter.getHitLine(characterName);
  }

  /**
   * @description Get Aang-specific emotional line
   */
  private getAangEmotionalLine(damageOutcome: DamageOutcome, emotionalState: string): string {
    if (damageOutcome === 'miss') {
      switch (emotionalState) {
        case 'desperate':
          return "Aang's movements betray his exhaustion—yet he fights on.";
        case 'pressed':
          return "His pacifist nature holds back the strike.";
        case 'frustrated':
          return "Aang's strike lacks conviction.";
        case 'surprised':
          return "The unexpected blow tests his calm.";
        case 'focused':
          return "Aang's attack whips by, stirring only dust.";
        case 'intense':
          return "His staff flickers but misses its mark.";
        case 'determined':
          return "The young monk's strike finds only empty air.";
        default:
          return "Aang hesitates—the moment passes.";
      }
    } else {
      switch (emotionalState) {
        case 'desperate':
          return "Aang's hope flickers but refuses to die.";
        case 'pressed':
          return "His pacifist nature gives way to determination—the blow lands with controlled fury.";
        case 'frustrated':
          return "His movements betray his inner conflict—yet the strike still lands.";
        case 'surprised':
          return "The Avatar's training shows in his precise execution—the blow lands with controlled force.";
        case 'focused':
          return "Aang flows like water, staff flickering—his strike snaps across their shoulder.";
        case 'intense':
          return "His determination fuels his attack—the blow lands with surprising force.";
        case 'determined':
          return "Aang's hope hardens into resolve—his strike finds its mark.";
        default:
          return "His staff strikes with the wisdom of his masters, finding its mark with gentle precision.";
      }
    }
  }

  /**
   * @description Get Azula-specific emotional line
   */
  private getAzulaEmotionalLine(damageOutcome: DamageOutcome, emotionalState: string): string {
    if (damageOutcome === 'miss') {
      switch (emotionalState) {
        case 'desperate':
          return "Azula's control slips—her fury disrupts her precision.";
        case 'pressed':
          return "The perfect facade cracks—the strike goes wide.";
        case 'frustrated':
          return "The princess's fury disrupts her calculated strike.";
        case 'surprised':
          return "Azula sidesteps, a ghost in blue fire.";
        case 'focused':
          return "Her calculated strike finds only empty air.";
        case 'intense':
          return "Her blue flames dance but miss their mark.";
        case 'determined':
          return "The princess's precision fails her for once.";
        default:
          return "Her control slips—the attack finds only air.";
      }
    } else {
      switch (emotionalState) {
        case 'desperate':
          return "Azula's perfect facade finally cracks under pressure.";
        case 'pressed':
          return "Her calculated fury is a weapon in itself.";
        case 'frustrated':
          return "Her flames dance with deadly grace, finding their mark.";
        case 'surprised':
          return "Azula's blue fire strikes with controlled precision.";
        case 'focused':
          return "Her control remains absolute—the strike lands perfectly.";
        case 'intense':
          return "Azula's firebending is poetry of destruction.";
        case 'determined':
          return "The princess's precision is devastating.";
        default:
          return "Her flames engulf the opponent, searing through their defenses.";
      }
    }
  }

  /**
   * @description Compose environmental narrative with move-specific flavor
   */
  composeEnvironmentalNarrative(
    characterName: string,
    damageOutcome: DamageOutcome,
    moveName: string,
    memory: NarrativeMemoryEntry[]
  ): string | string[] {
    // Check for recent memory (last 3 turns)
    const recent = memory.filter(e => ['dodge','critical_hit','reversal','one_off_moment'].includes(e.type));
    let memoryLine = '';
    if (recent.length > 0) {
      const last = recent[recent.length - 1];
      memoryLine = `${characterName} is still affected by their recent ${last.type.replace('_',' ')}${last.move ? ` (${last.move})` : ''}.`;
    }
    // Get move-specific flavor if available (directly from router)
    const moveFlavor = this.characterRouter.getMoveFlavor(characterName, moveName, damageOutcome);
    if (moveFlavor) {
      const environmentalContext = this.variantsService.getEnvironmentalContext(0);
      const base = `${moveFlavor} ${environmentalContext}`;
      return memoryLine ? [memoryLine, base] : base;
    }
    
    // Fallback to standard environmental narrative
    const baseLine = damageOutcome === 'miss' 
      ? this.characterRouter.getMissLine(characterName)
      : this.characterRouter.getHitLine(characterName);
    
    // Add environmental context
    const environmentalContext = this.variantsService.getEnvironmentalContext(0);
    const base = `${baseLine} ${environmentalContext}`;
    return memoryLine ? [memoryLine, base] : base;
  }
}