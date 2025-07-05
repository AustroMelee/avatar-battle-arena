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
      'First blood is drawn in this epic clash!',
      'The battle begins in earnest with the first wound!',
      'Blood is spilled, marking the true beginning of this conflict!'
    ]);

    this.oneOffMomentPools.set('critical_hit', [
      'A devastating blow strikes true!',
      'The attack finds its mark with brutal precision!',
      'A critical strike that will be remembered!'
    ]);

    this.oneOffMomentPools.set('desperation_trigger', [
      'Desperation takes hold as survival becomes the only goal!',
      'The battle reaches a desperate turning point!',
      'All pretense of strategy gives way to raw survival instinct!'
    ]);

    this.oneOffMomentPools.set('escalation_trigger', [
      'The conflict escalates to new heights of intensity!',
      'The battle reaches a fever pitch!',
      'The stakes are raised as the combatants push their limits!'
    ]);

    this.oneOffMomentPools.set('pattern_break', [
      'The established pattern shatters!',
      'Predictability is thrown to the wind!',
      'The familiar rhythm is completely disrupted!'
    ]);

    this.oneOffMomentPools.set('final_gambit', [
      'The final gambit is played!',
      'All remaining strength is poured into this desperate move!',
      'The last reserves are called upon!'
    ]);

    this.oneOffMomentPools.set('victory_moment', [
      'Victory is claimed in this epic battle!',
      'The victor emerges triumphant!',
      'The conflict reaches its conclusion!'
    ]);

    this.oneOffMomentPools.set('defeat_moment', [
      'Defeat is accepted with dignity.',
      'The fallen warrior acknowledges their loss.',
      'The battle ends in defeat.'
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