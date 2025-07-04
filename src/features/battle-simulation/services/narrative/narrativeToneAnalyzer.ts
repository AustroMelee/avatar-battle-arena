// CONTEXT: Narrative System, // FOCUS: Narrative Tone Analysis
import type { MechanicalState } from './types';

/**
 * @description Determines narrative tone based on mechanical state
 * @param mechanics - The mechanical state to analyze
 * @returns The appropriate narrative tone
 */
export function determineNarrativeTone(mechanics: MechanicalState): 'desperate' | 'confident' | 'furious' | 'calculated' | 'chaotic' | 'defensive' | 'aggressive' {
  if (mechanics.forcedEscalation && mechanics.escalationType === 'damage') {
    return mechanics.damageDealt > 15 ? 'furious' : 'desperate';
  }
  
  if (mechanics.isVulnerable && mechanics.punishDamage > 0) {
    return 'calculated';
  }
  
  if (mechanics.moveRepetition >= 3) {
    return 'desperate';
  }
  
  if (mechanics.isLowDamage) {
    return 'defensive';
  }
  
  if (mechanics.isHighDamage) {
    return 'confident';
  }
  
  if (mechanics.repositionAttempts >= 3) {
    return 'desperate';
  }
  
  return 'calculated';
}

/**
 * @description Determines narrative intensity based on mechanical state
 * @param mechanics - The mechanical state to analyze
 * @returns The appropriate narrative intensity
 */
export function determineNarrativeIntensity(mechanics: MechanicalState): 'low' | 'medium' | 'high' | 'extreme' {
  if (mechanics.forcedEscalation) return 'extreme';
  if (mechanics.isVulnerable && mechanics.punishDamage > 0) return 'high';
  if (mechanics.isHighDamage) return 'high';
  if (mechanics.isLowDamage) return 'low';
  return 'medium';
}

/**
 * @description Determines narrative focus based on mechanical state
 * @param mechanics - The mechanical state to analyze
 * @returns The appropriate narrative focus
 */
export function determineNarrativeFocus(mechanics: MechanicalState): 'damage' | 'position' | 'pattern' | 'vulnerability' | 'escalation' | 'recovery' {
  if (mechanics.forcedEscalation) return 'escalation';
  if (mechanics.isVulnerable && mechanics.punishDamage > 0) return 'vulnerability';
  if (mechanics.moveRepetition >= 3) return 'pattern';
  if (mechanics.isCharging || mechanics.positionChanged) return 'position';
  if (mechanics.isHighDamage || mechanics.isLowDamage) return 'damage';
  if (mechanics.isRally || mechanics.isComeback) return 'recovery';
  return 'damage';
} 