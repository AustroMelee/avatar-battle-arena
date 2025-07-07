// CONTEXT: Pool Manager
// RESPONSIBILITY: Coordinate focused pool services only

import { DamageOutcomePool } from './DamageOutcomePool';
import { StateAnnouncementPool } from './StateAnnouncementPool';
import type { DamageOutcome, OneOffMomentType } from '../../types/NarrativeTypes';

/**
 * @description Simplified pool manager that coordinates focused pool services
 */
export class PoolManager {
  private damageOutcomePool: DamageOutcomePool;
  private stateAnnouncementPool: StateAnnouncementPool;
  private oneOffMomentPools: Map<OneOffMomentType, string[]> = new Map();

  constructor() {
    this.damageOutcomePool = new DamageOutcomePool();
    this.stateAnnouncementPool = new StateAnnouncementPool();
    this.initializeOneOffMomentPools();
  }

  /**
   * @description Initialize one-off moment pools
   */
  private initializeOneOffMomentPools(): void {
    this.oneOffMomentPools.set('first_blood', [
      "The first blow lands—so begins the unraveling.",
      "Blood is drawn. The tone is set.",
      "First contact—no more testing, no more restraint.",
      "The silence breaks with the first strike!",
      "A clean hit—this fight is real now."
    ]);

    this.oneOffMomentPools.set('critical_hit', [
      "A brutal strike—timing, force, and intent align perfectly!",
      "That blow changes everything—the tide turns!",
      "A precise and devastating hit! The crowd goes silent!",
      "No mere hit—that was a declaration of dominance.",
      "The attack lands like thunder—staggering, stunning, decisive!"
    ]);

    this.oneOffMomentPools.set('desperation_trigger', [
      "They're running on instinct now—form gives way to fury.",
      "Cornered and wounded, they unleash something raw.",
      "Desperation cracks through their calm—this is survival, not strategy.",
      "The mask falls—their eyes burn with primal resolve.",
      "Every movement now is a cry for survival—a last stand begins."
    ]);

    this.oneOffMomentPools.set('escalation_trigger', [
      "The heat rises—this is no longer a duel, but a storm.",
      "The battlefield boils with tension—the real fight begins now.",
      "No more restraint—both sides erupt with ferocity!",
      "The clash intensifies—each blow now carries the weight of the outcome.",
      "This is no longer testing tactics. This is war."
    ]);

    this.oneOffMomentPools.set('pattern_break', [
      "The rhythm fractures—one fighter dares to rewrite the tempo.",
      "A sudden shift—everything known becomes uncertain.",
      "They break the cycle—instinct overrides routine.",
      "The pattern crumbles—what worked before will fail now.",
      "Predictability is dead. Chaos takes the floor."
    ]);

    this.oneOffMomentPools.set('final_gambit', [
      "Their final hand is played—this is do or die.",
      "They commit everything—there's no recovery if this fails.",
      "No fallback, no defense—just one last, desperate push.",
      "The ultimate risk is taken—this is the endgame move.",
      "One last spark in a darkening sky—they go all in."
    ]);

    this.oneOffMomentPools.set('victory_moment', [
      "One warrior stands tall. The other lies still.",
      "Victory is earned—through sweat, fire, and unyielding will.",
      "The clash ends with a victor—marked by silence and dust.",
      "One side falters. The other ascends.",
      "The battle ends not with a bang—but a breath of finality."
    ]);

    this.oneOffMomentPools.set('defeat_moment', [
      "Their strength spent, they collapse—defeat undeniable.",
      "The warrior bows their head—the outcome clear.",
      "They fought until the end, but the end came nonetheless.",
      "Their fire fades—the battle slips from their grasp.",
      "In silence, they accept the fall. No more moves remain."
    ]);
  }

  /**
   * @description Get damage outcome narrative
   */
  getDamageOutcomeNarrative(outcome: DamageOutcome): string {
    return this.damageOutcomePool.getDamageOutcomeNarrative(outcome);
  }

  /**
   * @description Get state announcement narrative
   */
  getStateAnnouncementNarrative(stateType: string): string {
    return this.stateAnnouncementPool.getStateAnnouncementNarrative(stateType);
  }

  /**
   * @description Get one-off moment narrative
   */
  getOneOffMomentNarrative(momentType: OneOffMomentType): string {
    const pool = this.oneOffMomentPools.get(momentType);
    if (!pool || pool.length === 0) {
      return '';
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * @description Get all available damage outcomes
   */
  getAvailableDamageOutcomes(): DamageOutcome[] {
    return this.damageOutcomePool.getAvailableOutcomes();
  }

  /**
   * @description Get all available state types
   */
  getAvailableStateTypes(): string[] {
    return this.stateAnnouncementPool.getAvailableStateTypes();
  }

  /**
   * @description Get pool size for damage outcome
   */
  getDamageOutcomePoolSize(outcome: DamageOutcome): number {
    return this.damageOutcomePool.getPoolSize(outcome);
  }

  /**
   * @description Get pool size for state type
   */
  getStateAnnouncementPoolSize(stateType: string): number {
    return this.stateAnnouncementPool.getPoolSize(stateType);
  }
} 