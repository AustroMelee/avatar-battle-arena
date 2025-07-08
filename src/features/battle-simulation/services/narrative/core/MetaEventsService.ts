// Used via dynamic registry in Narrative system. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: Meta Events Service
// RESPONSIBILITY: Dynamic environment and world reaction events

/**
 * @description Service for generating meta events and environmental reactions
 */
export class MetaEventsService {
  private escalationMetaEvents = [
    "The pillars shake as the fury of battle rises.",
    "Distant thunder echoes through the throne room.",
    "The ancient stones themselves seem to tremble.",
    "A tremor runs through the palace floor.",
    "The air crackles with barely contained power.",
    "Shadows dance across the stone walls as flames illuminate the chamber.",
    "The very foundation of the Fire Nation Capital quakes.",
    "Spirits murmur at the edge of vision.",
    "The throne room becomes a maelstrom of elemental fury.",
    "The palace walls seem to absorb the intensity of the conflict."
  ];

  private criticalMetaEvents = [
    "The world itself seems to hold its breath.",
    "Time slows as the critical moment approaches.",
    "The air itself burns with their fury.",
    "Reality bends under the weight of their power.",
    "The very fabric of space seems to tear.",
    "A primal storm engulfs the battlefield.",
    "The elements themselves gather in anticipation.",
    "The throne room becomes a crucible of destiny.",
    "The ancient power of the Fire Nation resonates.",
    "The Avatar's presence fills the chamber with ancient energy."
  ];

  private desperationMetaEvents = [
    "The palace floor cracks under the strain.",
    "The air becomes thick with desperation.",
    "The throne room walls seem to close in.",
    "The very atmosphere becomes oppressive.",
    "Shadows lengthen as hope begins to fade.",
    "The palace itself seems to mourn the conflict.",
    "The air becomes charged with finality.",
    "The throne room becomes a tomb of broken dreams.",
    "The palace pillars weep with the weight of battle.",
    "The very stones seem to cry out in pain."
  ];

  private victoryMetaEvents = [
    "The throne room falls silent, the echoes of battle fading.",
    "The palace itself seems to acknowledge the victor.",
    "The air clears as the conflict reaches its conclusion.",
    "The ancient stones bear witness to the outcome.",
    "The throne room becomes a monument to the victor's will.",
    "The palace walls seem to bow to the victor's power.",
    "The very foundation of the Fire Nation Capital resonates.",
    "The throne room becomes a testament to the victor's strength.",
    "The palace itself seems to celebrate the victor's triumph.",
    "The ancient power of the Fire Nation acknowledges the victor."
  ];

  private defeatMetaEvents = [
    "The throne room becomes a tomb of broken spirits.",
    "The palace walls seem to mourn the fallen.",
    "The air becomes heavy with the weight of defeat.",
    "The ancient stones bear witness to the tragedy.",
    "The throne room becomes a monument to shattered dreams.",
    "The palace itself seems to weep for the fallen.",
    "The very foundation of the Fire Nation Capital mourns.",
    "The throne room becomes a testament to the cost of conflict.",
    "The palace itself seems to grieve for the defeated.",
    "The ancient power of the Fire Nation laments the loss."
  ];

  private patternBreakMetaEvents = [
    "The established order shatters like glass.",
    "The predictable rhythm is torn apart.",
    "The familiar dance becomes a chaotic brawl.",
    "The throne room becomes a stage for the unpredictable.",
    "The palace walls seem to recoil from the chaos.",
    "The very air itself rebels against the established pattern.",
    "The ancient stones bear witness to the disruption.",
    "The throne room becomes a crucible of change.",
    "The palace itself seems to embrace the chaos.",
    "The ancient power of the Fire Nation acknowledges the shift."
  ];

  /**
   * @description Get escalation meta event
   */
  getEscalationMetaEvent(): string {
    return this.escalationMetaEvents[Math.floor(Math.random() * this.escalationMetaEvents.length)];
  }

  /**
   * @description Get critical meta event
   */
  getCriticalMetaEvent(): string {
    return this.criticalMetaEvents[Math.floor(Math.random() * this.criticalMetaEvents.length)];
  }

  /**
   * @description Get desperation meta event
   */
  getDesperationMetaEvent(): string {
    return this.desperationMetaEvents[Math.floor(Math.random() * this.desperationMetaEvents.length)];
  }

  /**
   * @description Get victory meta event
   */
  getVictoryMetaEvent(): string {
    return this.victoryMetaEvents[Math.floor(Math.random() * this.victoryMetaEvents.length)];
  }

  /**
   * @description Get defeat meta event
   */
  getDefeatMetaEvent(): string {
    return this.defeatMetaEvents[Math.floor(Math.random() * this.defeatMetaEvents.length)];
  }

  /**
   * @description Get pattern break meta event
   */
  getPatternBreakMetaEvent(): string {
    return this.patternBreakMetaEvents[Math.floor(Math.random() * this.patternBreakMetaEvents.length)];
  }

  /**
   * @description Get random meta event based on context
   */
  getRandomMetaEvent(context: {
    isEscalation?: boolean;
    isCritical?: boolean;
    isDesperation?: boolean;
    isVictory?: boolean;
    isDefeat?: boolean;
    isPatternBreak?: boolean;
  }): string | null {
    // Only return meta events occasionally to avoid overwhelming the narrative
    if (Math.random() > 0.3) {
      return null;
    }

    if (context.isVictory) {
      return this.getVictoryMetaEvent();
    } else if (context.isDefeat) {
      return this.getDefeatMetaEvent();
    } else if (context.isCritical) {
      return this.getCriticalMetaEvent();
    } else if (context.isDesperation) {
      return this.getDesperationMetaEvent();
    } else if (context.isPatternBreak) {
      return this.getPatternBreakMetaEvent();
    } else if (context.isEscalation) {
      return this.getEscalationMetaEvent();
    }

    return null;
  }
} 