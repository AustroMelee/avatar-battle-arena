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
  context: NarrativeContext
): string {
  const intensity = getDamageIntensity(context.damage, context.maxHealth);
  
  // Character-specific contextual descriptions
  if (character === 'Azula') {
    return getAzulaContextualDescription(context, intensity);
  } else if (character === 'Aang') {
    return getAangContextualDescription(context, intensity);
  }
  
  // Generic contextual descriptions
  return getGenericContextualDescription(context, intensity);
}

/**
 * @description Azula-specific contextual descriptions (legendary flavor overhaul)
 */
function getAzulaContextualDescription(
  context: NarrativeContext,
  intensity: 'glancing' | 'solid' | 'devastating'
): string {
  if (context.isMiss) {
    const missReasons = [
      "Azula’s blue fire snaps, but her opponent slips through the flames—her frustration barely masked.",
      "A perfect angle, ruined by a heartbeat’s hesitation—the attack singes only air.",
      "Her calculated fury cracks the stone, but finds no flesh—Azula’s precision betrayed.",
      "An instant of arrogance—her fire curves too high, missing the mark and earning a glare."
    ];
    return missReasons[Math.floor(Math.random() * missReasons.length)];
  }

  switch (intensity) {
    case 'glancing':
      return [
        "Blue flames flicker along Azula’s fingertips, her strike probing for weakness rather than aiming to destroy.",
        "Azula’s fire lashes out—a whip of blue heat barely grazing her rival.",
        "A swift spark crackles past, singeing cloth and pride in equal measure.",
        "Her attack circles like a predator, searing the edges of her opponent’s defense."
      ][Math.floor(Math.random() * 4)];

    case 'solid':
      return [
        "Azula’s fire lances forward, burning a jagged line across her foe’s guard—her ruthlessness undeniable.",
        "A wave of blue flame crashes, breaking defenses and leaving the smell of scorched hair.",
        "Her eyes narrow—a bolt of fire bursts through, knocking the opponent off-balance and singed.",
        "The princess’s fury ignites—her flames batter the enemy, each strike a lesson in pain."
      ][Math.floor(Math.random() * 4)];

    case 'devastating':
      return [
        "Azula unleashes an inferno—blue firestorm roaring, her adversary engulfed in living light.",
        "With a scream of power, Azula’s flames erupt, scouring the arena and hammering her rival to the ground.",
        "She twists, blue fire arcing like a comet—impact so violent the crowd recoils, thunderstruck.",
        "Her mastery explodes—an avalanche of heat and will, reducing defenses to ash."
      ][Math.floor(Math.random() * 4)];
  }
}

/**
 * @description Aang-specific contextual descriptions (legendary flavor overhaul)
 */
function getAangContextualDescription(
  context: NarrativeContext,
  intensity: 'glancing' | 'solid' | 'devastating'
): string {
  if (context.isMiss) {
    const missReasons = [
      "Aang’s air whips past—too gentle, a whisper where there should be thunder.",
      "He pivots with perfect form, but his opponent dances just beyond the cyclone’s edge.",
      "The staff hums, but meets only silence—Aang’s hesitation rippling through every movement.",
      "A gust blows harmlessly, Aang’s mind clouded by doubt, his strike undone by mercy."
    ];
    return missReasons[Math.floor(Math.random() * missReasons.length)];
  }

  switch (intensity) {
    case 'glancing':
      return [
        "Aang rides a current of air, his strike feather-light—testing, teasing, refusing to harm.",
        "A deft twist sends a swirl of dust spinning—his touch barely registers, yet reminds the foe of his speed.",
        "Wind slips between fingers, brushing his rival aside but not breaking resolve.",
        "The Avatar moves with purpose, yet holds back—the attack a question, not a sentence."
      ][Math.floor(Math.random() * 4)];

    case 'solid':
      return [
        "A sudden gust, focused and fierce, slams into the opponent—Aang’s will rising in the storm.",
        "He channels centuries of mastery—staff cracks like thunder, sending his rival stumbling.",
        "Air howls as Aang’s palm finds its mark, balance lost in a heartbeat.",
        "With practiced motion, Aang sweeps the air—his enemy reels, every lesson of the Air Nomads in play."
      ][Math.floor(Math.random() * 4)];

    case 'devastating':
      return [
        "Aang summons the sky itself—cyclone shrieks, opponent hurled like a leaf in the wind.",
        "All hesitation burned away—his strike is a tidal wave, unrelenting, driven by destiny.",
        "The arena trembles—Aang’s power unleashed, every spirit in the world bearing witness.",
        "Aang’s eyes flash—air compresses, impact booming as if the world itself takes a breath."
      ][Math.floor(Math.random() * 4)];
  }
}

/**
 * @description Generic contextual descriptions (legendary flavor overhaul)
 */
function getGenericContextualDescription(
  context: NarrativeContext,
  intensity: 'glancing' | 'solid' | 'devastating'
): string {
  if (context.isMiss) {
    const missReasons = [
      "The blow whistles past, missing by inches—a heartbeat from disaster.",
      "Predictable and slow, the attack is dodged with practiced ease.",
      "Fatigue dulls the edge—precision lost, the move finds only empty space.",
      "Sweat-slick hands fumble, and the opponent slips free, untouched."
    ];
    return missReasons[Math.floor(Math.random() * missReasons.length)];
  }

  switch (intensity) {
    case 'glancing':
      return [
        "A probing strike—more warning than threat—leaves a fleeting sting.",
        "The attack lands but glances off armor or willpower, hardly noticed.",
        "A shallow cut, quickly forgotten in the rhythm of battle.",
        "The blow meets resistance, absorbed by trained reflexes."
      ][Math.floor(Math.random() * 4)];

    case 'solid':
      return [
        "A firm, bruising hit—a lesson in pain, if not defeat.",
        "The strike lands with enough force to stagger, breathing space won by determination.",
        "Momentum shifts as the attack connects, the crowd feeling its weight.",
        "Discipline rewarded—an unyielding blow disrupts the enemy’s footing."
      ][Math.floor(Math.random() * 4)];

    case 'devastating':
      return [
        "A devastating blow—a storm of violence that leaves the opponent gasping.",
        "The strike erupts like an earthquake, smashing all defenses aside.",
        "Overwhelmed and unready, the enemy crumples beneath the assault.",
        "This attack is a reckoning—pain, speed, and fury joined as one."
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