// CONTEXT: Character Narrative Service
// RESPONSIBILITY: Character-specific narrative lines with emotional responses

import type { NarrativeContext } from '../types/NarrativeTypes';

/**
 * @description Character-specific narrative lines and emotional responses
 */
export class CharacterNarrativeService {
  private aangMissLines = [
    "Aang's doubt flickers—he wonders if peace is even possible.",
    "The Avatar's hesitation costs him the opening.",
    "Aang's pacifism shows in his restrained strike.",
    "The young monk's uncertainty is evident in his timing.",
    "Aang's hope for reconciliation weakens his resolve.",
    "The Avatar's compassion stays his hand at the last moment.",
    "Aang's inner conflict manifests in his missed strike.",
    "The young bender's inexperience shows in his timing.",
    "Aang's desire for peace blunts his attack.",
    "The Avatar's mercy becomes his weakness."
  ];

  private aangHitLines = [
    "Aang's airbending flows like water, testing their defenses.",
    "The Avatar's movements are fluid, controlled.",
    "His staff flickers, air rippling around the opponent.",
    "Aang's training shows in his precise execution.",
    "The young monk's technique is flawless.",
    "Aang's airbending mastery is evident.",
    "The Avatar's movements betray his fatigue—the strike lacks its usual precision.",
    "His staff strikes with the wisdom of his masters, finding its mark.",
    "Aang's determination fuels his attack.",
    "The young bender's resolve strengthens his strike."
  ];

  private aangDesperationLines = [
    "Aang's hope is battered, but the storm inside him is relentless.",
    "No more holding back—the Avatar breathes in chaos and exhales resolve.",
    "The young monk's pacifism gives way to survival instinct.",
    "Aang's compassion is tested by the harsh reality of battle.",
    "The Avatar's gentle nature is pushed to its limits.",
    "Aang's inner peace is shattered by desperation.",
    "The young bender's innocence is lost in the heat of battle.",
    "Aang's hope flickers but refuses to die.",
    "The Avatar's resolve hardens despite his exhaustion.",
    "Aang's spirit refuses to be broken."
  ];

  private azulaMissLines = [
    "Azula's lips curl in scorn; she turns the miss into an opening of her own.",
    "The princess's confidence is unshaken by the failed strike.",
    "Azula's precision is off—her usual perfection falters.",
    "The Fire Nation princess's arrogance costs her the hit.",
    "Azula's control slips for a moment, revealing her frustration.",
    "The princess's calculated strike misses its mark.",
    "Azula's usual precision is compromised by her growing fury.",
    "The Fire Nation heir's confidence wavers briefly.",
    "Azula's perfect form is disrupted by her opponent's skill.",
    "The princess's arrogance blinds her to the opening."
  ];

  private azulaHitLines = [
    "Azula's flames dance across their guard.",
    "Her fire strikes with controlled precision.",
    "The blue flames test their opponent's resolve.",
    "Azula's calculated strike finds its mark.",
    "Her firebending mastery is evident.",
    "The princess's technique is flawless.",
    "Azula's blue fire strikes with deadly accuracy!",
    "Her flames engulf the opponent, searing through their defenses.",
    "The Fire Nation princess's fury fuels her attack.",
    "Azula's precision is devastating."
  ];

  private azulaDesperationLines = [
    "Azula's perfect facade begins to crack under the pressure.",
    "The princess's calculated control gives way to raw fury.",
    "Azula's arrogance is replaced by desperate determination.",
    "The Fire Nation heir's confidence is shaken.",
    "Azula's usual precision is compromised by desperation.",
    "The princess's perfect form begins to unravel.",
    "Azula's calculated approach becomes frantic.",
    "The Fire Nation princess's control slips.",
    "Azula's arrogance is replaced by survival instinct.",
    "The princess's facade crumbles under the strain."
  ];

  /**
   * @description Get character-specific miss line
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getMissLine(characterName: string, context: NarrativeContext): string {
    if (characterName.toLowerCase().includes('aang')) {
      return this.aangMissLines[Math.floor(Math.random() * this.aangMissLines.length)];
    } else if (characterName.toLowerCase().includes('azula')) {
      return this.azulaMissLines[Math.floor(Math.random() * this.azulaMissLines.length)];
    }
    return "The attack misses its mark.";
  }

  /**
   * @description Get character-specific hit line
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getHitLine(characterName: string, context: NarrativeContext): string {
    if (characterName.toLowerCase().includes('aang')) {
      return this.aangHitLines[Math.floor(Math.random() * this.aangHitLines.length)];
    } else if (characterName.toLowerCase().includes('azula')) {
      return this.azulaHitLines[Math.floor(Math.random() * this.azulaHitLines.length)];
    }
    return "The attack connects with solid force.";
  }

  /**
   * @description Get character-specific desperation line
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getDesperationLine(characterName: string, context: NarrativeContext): string {
    if (characterName.toLowerCase().includes('aang')) {
      return this.aangDesperationLines[Math.floor(Math.random() * this.aangDesperationLines.length)];
    } else if (characterName.toLowerCase().includes('azula')) {
      return this.azulaDesperationLines[Math.floor(Math.random() * this.azulaDesperationLines.length)];
    }
    return "Desperation fuels their movements!";
  }

  /**
   * @description Get character-specific victory line
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getVictoryLine(characterName: string, context: NarrativeContext): string {
    if (characterName.toLowerCase().includes('aang')) {
      return "Aang stands victorious, his gentle spirit tempered by the harsh reality of battle. The Avatar's hope for peace remains unbroken.";
    } else if (characterName.toLowerCase().includes('azula')) {
      return "Azula stands over the fallen Avatar, her shadow stretching long and victorious. Blue fire still crackles at her fingertips, a testament to her unyielding will.";
    }
    return `${characterName} emerges victorious from the battle.`;
  }

  /**
   * @description Get character-specific defeat line
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getDefeatLine(characterName: string, context: NarrativeContext): string {
    if (characterName.toLowerCase().includes('aang')) {
      return "Aang's breath fades, but the winds whisper his promise: this is not the end. The Avatar's spirit remains unbroken, even in defeat.";
    } else if (characterName.toLowerCase().includes('azula')) {
      return "Azula's perfect facade finally crumbles as she falls. The Fire Nation princess's arrogance is replaced by bitter defeat.";
    }
    return `${characterName} falls, unable to continue.`;
  }
} 