// CONTEXT: Narrative System, // FOCUS: Contextual Narrative Mapping with Pool Integration
import type { NarrativeMechanic } from './types';

/**
 * @description Context for narrative generation
 */
export type NarrativeContext = {
  damage: number;
  maxHealth: number;
  isMiss: boolean;
  isCritical: boolean;
  isPatternBreak: boolean;
  isEscalation: boolean;
  consecutiveHits: number;
  consecutiveMisses: number;
  turnNumber: number;
  characterState: 'fresh' | 'wounded' | 'exhausted' | 'desperate';
};

/**
 * @description Maps damage outcomes to narrative intensity
 */
export function getDamageIntensity(damage: number, maxHealth: number): 'glancing' | 'solid' | 'devastating' {
  const percentage = (damage / maxHealth) * 100;
  
  if (percentage < 10) return 'glancing';
  if (percentage < 25) return 'solid';
  return 'devastating';
}

/**
 * @description Gets contextual move descriptions that avoid logic leaks
 * @deprecated Use NarrativePoolManager instead for better variety and rotation
 */
export function getContextualMoveDescription(
  character: string,
  context: NarrativeContext,
  baseMove: string
): string {
  const intensity = getDamageIntensity(context.damage, context.maxHealth);
  
  // Character-specific contextual descriptions
  if (character === 'Azula') {
    return getAzulaContextualDescription(context, intensity, baseMove);
  } else if (character === 'Aang') {
    return getAangContextualDescription(context, intensity, baseMove);
  }
  
  // Generic contextual descriptions
  return getGenericContextualDescription(context, intensity, baseMove);
}

/**
 * @description Azula-specific contextual descriptions
 * @deprecated Use NarrativePoolManager instead
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getAzulaContextualDescription(
  context: NarrativeContext,
  intensity: 'glancing' | 'solid' | 'devastating',
  _baseMove: string // intentionally unused
): string {
  if (context.isMiss) {
    const missReasons = [
      "Azula's blue fire crackles but finds only empty air",
      "Her calculated strike is a fraction too slow",
      "The fire bends wide, missing its intended target",
      "Azula's precision falters for a crucial moment"
    ];
    return missReasons[Math.floor(Math.random() * missReasons.length)];
  }

  switch (intensity) {
    case 'glancing':
      return [
        "Blue fire licks at the opponent's defenses",
        "Azula's flames dance across their guard",
        "Her fire strikes with controlled precision",
        "The blue flames test their opponent's resolve"
      ][Math.floor(Math.random() * 4)];
      
    case 'solid':
      return [
        "Azula's blue fire strikes with deadly accuracy!",
        "Her flames engulf the opponent, searing through their defenses",
        "Blue fire blazes forth, the heat intense and unrelenting",
        "Azula's calculated strike finds its mark with devastating effect"
      ][Math.floor(Math.random() * 4)];
      
    case 'devastating':
      return [
        "Blue fire engulfs the opponent, blasting them across the ring. The crowd gasps—Azula's power is inescapable!",
        "Azula's eyes glitter as she hurls blue fire, a tidal wave of destruction rolling toward her foe!",
        "The arena trembles as Azula unleashes her full fury—blue flames consume everything in their path!",
        "Azula's mastery of firebending reaches its peak—her opponent is caught in an inferno of blue destruction!"
      ][Math.floor(Math.random() * 4)];
  }
}

/**
 * @description Aang-specific contextual descriptions
 * @deprecated Use NarrativePoolManager instead
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getAangContextualDescription(
  context: NarrativeContext,
  intensity: 'glancing' | 'solid' | 'devastating',
  _baseMove: string // intentionally unused
): string {
  if (context.isMiss) {
    const missReasons = [
      "Aang's strike glances off their guard, his hesitation showing as exhaustion creeps in",
      "His airbending flows wide, the opponent reading his intent",
      "The staff sweeps through empty space, timing just slightly off",
      "Aang's movements betray his fatigue—the strike lacks its usual precision"
    ];
    return missReasons[Math.floor(Math.random() * missReasons.length)];
  }

  switch (intensity) {
    case 'glancing':
      return [
        "Aang's airbending flows like water, testing their defenses",
        "His staff flickers, air rippling around the opponent",
        "A gentle breeze carries Aang's strike to its target",
        "The airbender's movements are fluid, controlled"
      ][Math.floor(Math.random() * 4)];
      
    case 'solid':
      return [
        "Aang flows like water, staff flickering—his strike snaps across their shoulder, stinging pride and skin alike",
        "Air ripples from the impact as Aang's palm strike lands squarely!",
        "His staff strikes with the wisdom of his masters, finding its mark",
        "Aang's airbending technique proves effective—the opponent staggers from the blow"
      ][Math.floor(Math.random() * 4)];
      
    case 'devastating':
      return [
        "Aang channels the fury of the storm—his strike sends them flying, air howling around the impact!",
        "Drawing upon every lesson of his masters, Aang's attack is unstoppable!",
        "The airbender's power reaches its peak—his opponent is caught in a whirlwind of destruction!",
        "Aang's mastery of airbending is absolute—the arena itself seems to hold its breath!"
      ][Math.floor(Math.random() * 4)];
  }
}

/**
 * @description Generic contextual descriptions for other characters
 * @deprecated Use NarrativePoolManager instead
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getGenericContextualDescription(
  context: NarrativeContext,
  intensity: 'glancing' | 'solid' | 'devastating',
  _baseMove: string // intentionally unused
): string {
  if (context.isMiss) {
    const missReasons = [
      "Their strike glances off the opponent's guard",
      "The attack finds only empty air",
      "Timing is slightly off—the blow misses its mark",
      "Their movements betray fatigue—precision falters"
    ];
    return missReasons[Math.floor(Math.random() * missReasons.length)];
  }

  switch (intensity) {
    case 'glancing':
      return [
        "Their attack connects but with minimal impact",
        "The strike lands but fails to penetrate defenses",
        "A solid hit, though not devastating",
        "The blow finds its target but lacks power"
      ][Math.floor(Math.random() * 4)];
      
    case 'solid':
      return [
        "Their strike lands with satisfying impact!",
        "The attack connects solidly, drawing a reaction",
        "A well-placed blow that clearly hurts",
        "Their technique proves effective—the opponent staggers"
      ][Math.floor(Math.random() * 4)];
      
    case 'devastating':
      return [
        "Their attack is devastating—the opponent is sent reeling!",
        "The blow lands with incredible force, the impact echoing through the arena!",
        "Their power is overwhelming—the opponent is caught completely off guard!",
        "The strike is unstoppable—destruction follows in its wake!"
      ][Math.floor(Math.random() * 4)];
  }
}

/**
 * @description Gets escalation descriptions that avoid technical terms
 */
export function getEscalationDescription(character: string, count: number): string {
  const escalationLines = {
    Azula: [
      "The arena tightens—Azula has nowhere left to run. Her blue fire intensifies!",
      "Azula's eyes flash with renewed determination—her flames burn brighter than ever!",
      "The pressure mounts—Azula's firebending reaches new heights of destruction!",
      "Azula senses the turning tide—her next attack will be her most devastating yet!"
    ],
    Aang: [
      "The arena tightens—Aang has nowhere left to run. His airbending intensifies!",
      "Aang draws upon every lesson of his masters—his power surges forward!",
      "The pressure mounts—Aang's airbending reaches new heights of precision!",
      "Aang senses the turning tide—his next attack will be his most devastating yet!"
    ]
  };

  const lines = escalationLines[character as keyof typeof escalationLines] || escalationLines.Aang;
  return lines[count % lines.length];
}

/**
 * @description Gets pattern break descriptions that avoid technical terms
 */
export function getPatternBreakDescription(character: string, count: number): string {
  const patternBreakLines = {
    Azula: [
      "Azula's movements turn unpredictable, serpentine—she abandons her old rhythm!",
      "The repetitive rhythm shatters as Azula adapts her fighting style!",
      "Azula feels the pattern and consciously chooses to disrupt it!",
      "Azula's tactics shift—her opponent's predictability becomes her advantage!"
    ],
    Aang: [
      "Aang's movements become fluid and unpredictable—he adapts to the changing battle!",
      "The repetitive rhythm shatters as Aang adapts his fighting style!",
      "Aang senses the pattern and consciously chooses to disrupt it!",
      "Aang's tactics shift—his opponent's predictability becomes his advantage!"
    ]
  };

  const lines = patternBreakLines[character as keyof typeof patternBreakLines] || patternBreakLines.Aang;
  return lines[count % lines.length];
}

/**
 * @description Gets state transition descriptions
 */
export function getStateTransitionDescription(
  mechanic: NarrativeMechanic,
  character: string,
  count: number
): string {
  switch (mechanic) {
    case 'forced_escalation':
      return getEscalationDescription(character, count);
    case 'pattern_break':
      return getPatternBreakDescription(character, count);
    case 'desperation_unlock':
      return `${character} reaches deep within, finding reserves of strength they didn't know they had!`;
    case 'finisher':
      return `${character} channels their ultimate power—this attack will decide everything!`;
    default:
      return '';
  }
} 