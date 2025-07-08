// Used via dynamic registry in Narrative system. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: Spirit Reaction Service
// RESPONSIBILITY: Spirit reactions and meta-events for atmospheric depth

/**
 * @description Service for generating spirit reactions and meta-events
 */
export class SpiritReactionService {
  private spiritObservationLines = [
    "Far above, unseen spirits observe the clash in silence.",
    "The memory of past Avatars weighs on the moment.",
    "Ancient spirits whisper in the shadows of the throne room.",
    "The spirits of the Fire Nation ancestors watch with bated breath.",
    "The Avatar's past lives echo through the chamber.",
    "Spirits of the elements gather to witness this clash.",
    "The ancient wisdom of the Air Nomads lingers in the air.",
    "Spirits of the Fire Nation's past rulers observe silently.",
    "The balance of the world hangs in the spirits' judgment.",
    "Ethereal whispers carry through the ancient stones."
  ];

  private criticalMomentSpiritLines = [
    "The spirits themselves seem to hold their breath.",
    "Ancient power resonates through the throne room.",
    "The Avatar's connection to the spirit world intensifies.",
    "Spirits of the elements converge on this moment.",
    "The balance of nature itself is tested.",
    "Ethereal energy crackles through the air.",
    "The spirits of the past converge on this battle.",
    "Ancient wisdom flows through the Avatar's movements.",
    "The spirit world itself seems to tremble.",
    "Ethereal forces gather around the combatants."
  ];

  private desperationSpiritLines = [
    "The spirits mourn the necessity of this conflict.",
    "Ancient wisdom weeps for the fallen.",
    "The spirit world itself seems to grieve.",
    "Ethereal forces recoil from the desperation.",
    "The spirits of peace cry out in the shadows.",
    "Ancient power laments the cost of war.",
    "The balance of the world trembles with each blow.",
    "Spirits of harmony flee from the chaos.",
    "The ethereal realm itself seems to mourn.",
    "Ancient wisdom is tested by this desperation."
  ];

  private victorySpiritLines = [
    "The spirits acknowledge the victor's strength.",
    "Ancient power resonates with the outcome.",
    "The spirit world itself celebrates the victor.",
    "Ethereal forces bow to the victor's will.",
    "The spirits of the past approve of this outcome.",
    "Ancient wisdom flows through the victor's triumph.",
    "The balance of the world is restored.",
    "Spirits of the elements acknowledge the victor.",
    "The ethereal realm itself celebrates.",
    "Ancient power flows through the victor's veins."
  ];

  private defeatSpiritLines = [
    "The spirits mourn the fallen warrior.",
    "Ancient power laments the defeat.",
    "The spirit world itself seems to grieve.",
    "Ethereal forces weep for the fallen.",
    "The spirits of the past mourn this loss.",
    "Ancient wisdom is tested by this defeat.",
    "The balance of the world is disrupted.",
    "Spirits of the elements mourn the fallen.",
    "The ethereal realm itself seems to mourn.",
    "Ancient power flows away from the defeated."
  ];

  /**
   * @description Get spirit observation line
   */
  getSpiritObservation(): string {
    return this.spiritObservationLines[Math.floor(Math.random() * this.spiritObservationLines.length)];
  }

  /**
   * @description Get critical moment spirit line
   */
  getCriticalMomentSpiritLine(): string {
    return this.criticalMomentSpiritLines[Math.floor(Math.random() * this.criticalMomentSpiritLines.length)];
  }

  /**
   * @description Get desperation spirit line
   */
  getDesperationSpiritLine(): string {
    return this.desperationSpiritLines[Math.floor(Math.random() * this.desperationSpiritLines.length)];
  }

  /**
   * @description Get victory spirit line
   */
  getVictorySpiritLine(): string {
    return this.victorySpiritLines[Math.floor(Math.random() * this.victorySpiritLines.length)];
  }

  /**
   * @description Get defeat spirit line
   */
  getDefeatSpiritLine(): string {
    return this.defeatSpiritLines[Math.floor(Math.random() * this.defeatSpiritLines.length)];
  }

  /**
   * @description Get random spirit reaction based on context
   */
  getRandomSpiritReaction(context: {
    isCritical?: boolean;
    isDesperation?: boolean;
    isVictory?: boolean;
    isDefeat?: boolean;
    turnNumber?: number;
  }): string | null {
    // Only return spirit reactions occasionally to avoid overwhelming the narrative
    if (Math.random() > 0.25) {
      return null;
    }

    // Special spirit reactions for key moments
    if (context.isVictory) {
      return this.getVictorySpiritLine();
    } else if (context.isDefeat) {
      return this.getDefeatSpiritLine();
    } else if (context.isCritical) {
      return this.getCriticalMomentSpiritLine();
    } else if (context.isDesperation) {
      return this.getDesperationSpiritLine();
    }

    // General spirit observations for regular turns
    if (context.turnNumber && context.turnNumber % 5 === 0) {
      return this.getSpiritObservation();
    }

    return null;
  }
} 