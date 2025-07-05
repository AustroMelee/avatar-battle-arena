// CONTEXT: Narrative Composer
// RESPONSIBILITY: Compose narrative lines from fragments and components

import type { NarrativeContext, DamageOutcome } from '../types/NarrativeTypes';
import { CharacterNarrativeRouter } from './CharacterNarrativeRouter';
import { NarrativeVariantsService } from './NarrativeVariantsService';
import { PoolManager } from './pools/PoolManager';

/**
 * @description Service responsible for composing narrative lines from various components
 */
export class NarrativeComposer {
  private characterRouter: CharacterNarrativeRouter;
  private variantsService: NarrativeVariantsService;
  private poolManager: PoolManager;

  constructor(
    characterRouter: CharacterNarrativeRouter,
    variantsService: NarrativeVariantsService,
    poolManager: PoolManager
  ) {
    this.characterRouter = characterRouter;
    this.variantsService = variantsService;
    this.poolManager = poolManager;
  }

  /**
   * @description Compose technical narrative focusing on move execution
   */
  composeTechnicalNarrative(characterName: string, damageOutcome: DamageOutcome, _context: NarrativeContext, moveName: string): string {
    // Try to get move-specific flavor first
    const moveFlavor = this.characterRouter.getMoveFlavor(characterName, moveName, damageOutcome);
    if (moveFlavor) {
      return moveFlavor;
    }
    
    // Fall back to character-specific lines
    if (damageOutcome === 'miss') {
      return this.characterRouter.getMissLine(characterName);
    } else if (damageOutcome === 'hit') {
      return this.characterRouter.getHitLine(characterName);
    } else {
      return this.variantsService.getDamageOutcomeVariant(damageOutcome);
    }
  }

  /**
   * @description Compose emotional narrative with state tracking
   */
  composeEmotionalNarrative(
    characterName: string, 
    damageOutcome: DamageOutcome, 
    context: NarrativeContext, 
    moveName: string,
    emotionalState: string,
    shouldNarrateEmotion: boolean,
    emotionalEnhancement: string
  ): string {
    // Get move-specific flavor if available
    const moveFlavor = this.getMoveSpecificFlavor(characterName, moveName, damageOutcome);
    if (moveFlavor) {
      // Only add emotional enhancement if state actually changed
      if (shouldNarrateEmotion) {
        return `${moveFlavor} ${emotionalEnhancement}`;
      }
      return moveFlavor;
    }
    
    // Fallback to standard emotional narrative with enhanced emotional state selection
    const baseLine = this.getEmotionallyAppropriateLine(characterName, damageOutcome, emotionalState);
    
    // Only add emotional enhancement if state actually changed
    if (shouldNarrateEmotion) {
      return `${baseLine} ${emotionalEnhancement}`;
    }
    return baseLine;
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
  composeEnvironmentalNarrative(characterName: string, damageOutcome: DamageOutcome, context: NarrativeContext, moveName: string): string {
    // Get move-specific flavor if available
    const moveFlavor = this.getMoveSpecificFlavor(characterName, moveName, damageOutcome);
    if (moveFlavor) {
      const environmentalContext = this.variantsService.getEnvironmentalContext(context.turnNumber);
      return `${moveFlavor} ${environmentalContext}`;
    }
    
    // Fallback to standard environmental narrative
    const baseLine = damageOutcome === 'miss' 
      ? this.characterRouter.getMissLine(characterName)
      : this.characterRouter.getHitLine(characterName);
    
    // Add environmental context
    const environmentalContext = this.variantsService.getEnvironmentalContext(context.turnNumber);
    return `${baseLine} ${environmentalContext}`;
  }

  /**
   * @description Compose victory narrative with enhanced variety
   */
  composeVictoryNarrative(winnerName: string, loserName: string): string {
    const victoryLine = this.characterRouter.getVictoryLine(winnerName);
    const defeatLine = this.characterRouter.getDefeatLine(loserName);
    
    // Add environmental context to victory
    const environmentalContext = this.variantsService.getVictoryEnvironmentalContext();
    
    return `${victoryLine} ${defeatLine} ${environmentalContext}`;
  }

  /**
   * @description Compose desperation narrative with anti-repetition
   */
  composeDesperationNarrative(characterName: string, _context: NarrativeContext): string {
    const desperationLine = this.characterRouter.getDesperationLine(characterName);
    const stateAnnouncement = this.poolManager.getStateAnnouncementNarrative('desperation');
    
    return `${desperationLine} ${stateAnnouncement}`;
  }

  /**
   * @description Compose escalation narrative
   */
  composeEscalationNarrative(characterName: string, context: NarrativeContext): string {
    const escalationLine = this.characterRouter.getEscalationLine(characterName, context);
    return escalationLine || '';
  }

  /**
   * @description Get move-specific flavor from character services
   */
  private getMoveSpecificFlavor(characterName: string, moveName: string, damageOutcome: DamageOutcome): string | null {
    if (!moveName) return null;
    
    // Get move flavor from character router
    const moveFlavor = this.characterRouter.getMoveFlavor(characterName, moveName, damageOutcome);
    return moveFlavor || null;
  }

  /**
   * @description Get character-specific emotional state description with anti-repetition
   */
  getEmotionalStateDescription(characterName: string, emotionalState: string): string {
    if (characterName.toLowerCase().includes('aang')) {
      switch (emotionalState) {
        case 'desperate': return "His gentle spirit is pushed to its absolute limits.";
        case 'pressed': return "His pacifist nature struggles against the brutal reality.";
        case 'focused': return "The Avatar's movements become more deliberate.";
        case 'surprised': return "The unexpected blow tests his calm.";
        case 'alert': return "His training guides his response.";
        case 'intense': return "His determination reaches new heights.";
        case 'determined': return "His resolve hardens with each strike.";
        case 'steady': return "His gentle spirit remains unbroken.";
        case 'frustrated': return "His movements betray his inner conflict.";
        case 'confident': return "His hope hardens into resolve.";
        default: return "His gentle spirit remains unbroken.";
      }
    } else if (characterName.toLowerCase().includes('azula')) {
      switch (emotionalState) {
        case 'desperate': return "Her perfect facade is finally shattered.";
        case 'pressed': return "Her control is tested by the intensity.";
        case 'focused': return "Her precision becomes razor-sharp.";
        case 'surprised': return "The princess's composure wavers.";
        case 'alert': return "Her calculated approach adapts.";
        case 'intense': return "Her control grows stronger with each exchange.";
        case 'determined': return "Her control remains unshakeable.";
        case 'steady': return "Her perfect facade remains unbroken.";
        case 'frustrated': return "Her perfect facade begins to crack.";
        case 'confident': return "Her calculated approach shows mastery.";
        default: return "Her perfect facade remains unbroken.";
      }
    }
    
    return "";
  }
} 