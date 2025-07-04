// CONTEXT: Narrative System, // FOCUS: Enhanced State Narratives
import type { NarrativeContext } from './contextualNarrativeMapper';

/**
 * @description Gets breaking point narratives with variety
 */
export function getBreakingPointNarratives(): string[] {
  return [
    "The battle reaches a breaking point! Both fighters are forced to escalate or face defeat!",
    "Neither fighter can hold back now; a single misstep means disaster.",
    "Each breath, every motion, feels like the threshold to oblivion.",
    "The tension is unbearable—one wrong move will end everything.",
    "The arena itself seems to hold its breath—this is the moment of truth."
  ];
}

/**
 * @description Gets escalation narratives with variety and character-specific details
 */
export function getEscalationNarratives(character: string): string[] {
  const baseEscalations = [
    "The arena trembles with anticipation!",
    "The pressure mounts to unbearable levels!",
    "Every movement becomes a matter of life and death!",
    "The crowd's cheers fade into a tense silence!",
    "The very air crackles with impending violence!"
  ];

  const characterEscalations = {
    Azula: [
      "Azula's eyes flash with renewed determination—her flames burn brighter than ever!",
      "The princess's blue fire intensifies, her normally calculated precision giving way to raw power!",
      "Azula can feel the turning tide—her next attack will be her most devastating yet!",
      "The firebender's movements become more aggressive, her blue flames lashing out with increasing ferocity!",
      "Azula's focus narrows to a razor's edge—she's done playing games!"
    ],
    Aang: [
      "Aang draws upon every lesson of his masters—his power surges forward!",
      "The airbender's movements become more fluid, more unpredictable!",
      "Aang senses the turning tide—his next attack will be his most devastating yet!",
      "The Avatar's training takes over—his airbending reaches new heights of precision!",
      "Aang's stance widens, every muscle quivering with ready energy!"
    ]
  };

  const lines = characterEscalations[character as keyof typeof characterEscalations] || characterEscalations.Aang;
  return [...baseEscalations, ...lines];
}

/**
 * @description Gets desperation narratives with character-specific details
 */
export function getDesperationNarratives(character: string): string[] {
  const characterDesperations = {
    Azula: [
      "Blood on her lip, Azula bares her teeth and charges, heedless of risk!",
      "The princess's normally perfect form falters—she's fighting like a cornered animal!",
      "Azula's blue fire sputters and flares unpredictably—she's pushing beyond her limits!",
      "The firebender's movements become reckless, desperate—she has nothing left to lose!",
      "Azula fights like a wounded predator—dangerous, but vulnerable!"
    ],
    Aang: [
      "Aang fights like a cornered animal—desperate, ferocious!",
      "The gentle airbender's movements become wild, unpredictable—he's fighting for survival!",
      "Aang's staff lashes out, seeking the tiniest weakness—he's beyond technique now!",
      "The Avatar's normally fluid movements become jerky, desperate—he's running on pure instinct!",
      "Aang's airbending becomes chaotic, powerful but uncontrolled—he's fighting like a wounded beast!"
    ]
  };

  const lines = characterDesperations[character as keyof typeof characterDesperations] || characterDesperations.Aang;
  return lines;
}

/**
 * @description Gets tactical response narratives based on context
 */
export function getTacticalResponseNarratives(
  character: string,
  context: NarrativeContext,
  mechanic: string
): string[] {
  const responses: string[] = [];

  // Repetition detected
  if (mechanic === 'pattern_break') {
    const repetitionResponses = {
      Azula: [
        "Azula grows wary of Aang's repeated tactics—she adapts her approach!",
        "The princess recognizes the pattern and consciously disrupts it!",
        "Azula's movements become unpredictable, serpentine—she abandons her old rhythm!"
      ],
      Aang: [
        "Aang senses Azula's predictability and consciously chooses to disrupt it!",
        "The airbender's movements become fluid and unpredictable—he adapts to the changing battle!",
        "Aang's tactics shift—his opponent's predictability becomes his advantage!"
      ]
    };
    responses.push(...(repetitionResponses[character as keyof typeof repetitionResponses] || repetitionResponses.Aang));
  }

  // Punish phase
  if (context.damage > 20) {
    const punishResponses = {
      Azula: [
        "Azula finds her opening—her flames snap out to punish Aang's overreach!",
        "The princess capitalizes on the moment—her blue fire strikes with devastating precision!",
        "Azula's timing is perfect—she catches Aang in a moment of vulnerability!"
      ],
      Aang: [
        "Aang seizes the opportunity—his strike finds the perfect opening!",
        "The airbender's timing is impeccable—he catches Azula off guard!",
        "Aang capitalizes on the moment—his attack strikes with devastating effect!"
      ]
    };
    responses.push(...(punishResponses[character as keyof typeof punishResponses] || punishResponses.Aang));
  }

  // Low HP desperation
  if (context.characterState === 'desperate') {
    const lowHpResponses = {
      Azula: [
        "Blood on her lip, Azula bares her teeth and charges, heedless of risk!",
        "The princess fights like a wounded predator—dangerous, but vulnerable!",
        "Azula's normally perfect form falters—she's fighting for survival now!"
      ],
      Aang: [
        "Aang fights like a cornered animal—desperate, ferocious!",
        "The gentle airbender's movements become wild, unpredictable!",
        "Aang's staff lashes out, seeking the tiniest weakness—he's beyond technique now!"
      ]
    };
    responses.push(...(lowHpResponses[character as keyof typeof lowHpResponses] || lowHpResponses.Aang));
  }

  return responses;
}

/**
 * @description Gets late-game intensity narratives
 */
export function getLateGameNarratives(character: string, turnNumber: number): string[] {
  if (turnNumber < 15) return [];

  const lateGameNarratives = {
    Azula: [
      "Azula's focus narrows to a razor's edge—she's done playing games!",
      "The princess's blue fire becomes a storm of destruction!",
      "Azula's movements are pure precision—every strike calculated to end this!",
      "The firebender's power reaches its peak—her opponent is caught in an inferno!",
      "Azula's mastery of firebending is absolute—the arena itself seems to burn!"
    ],
    Aang: [
      "Aang channels the fury of the storm—his power is unstoppable!",
      "The airbender's movements become pure air—fluid, formless, impossible to pin down!",
      "Aang's staff strikes with the wisdom of his masters—every blow is devastating!",
      "The Avatar's power reaches its peak—his opponent is caught in a whirlwind!",
      "Aang's mastery of airbending is absolute—the arena itself seems to hold its breath!"
    ]
  };

  return lateGameNarratives[character as keyof typeof lateGameNarratives] || lateGameNarratives.Aang;
}

/**
 * @description Gets contextual move escalation narratives
 */
export function getContextualMoveEscalation(
  character: string,
  context: NarrativeContext,
  baseMove: string
): string {
  const intensity = context.damage / context.maxHealth;
  
  if (intensity > 0.3) {
    // High damage - escalate the description
    const highDamageEscalations = {
      Azula: [
        "Azula's blue fire becomes a storm of destruction!",
        "The princess's flames engulf everything in their path!",
        "Azula's power reaches its peak—her opponent is caught in an inferno!"
      ],
      Aang: [
        "Aang channels the fury of the storm—his power is unstoppable!",
        "The airbender's movements become pure air—impossible to predict!",
        "Aang's mastery reaches its peak—his opponent is caught in a whirlwind!"
      ]
    };
    const lines = highDamageEscalations[character as keyof typeof highDamageEscalations] || highDamageEscalations.Aang;
    return lines[Math.floor(Math.random() * lines.length)];
  }
  
  return baseMove;
} 