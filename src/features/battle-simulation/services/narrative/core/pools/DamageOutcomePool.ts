// CONTEXT: Damage Outcome Pool
// RESPONSIBILITY: Manage damage outcome narrative pools only

import type { DamageOutcome } from '../../types/NarrativeTypes';

/**
 * @description Service for managing damage outcome narrative pools
 */
export class DamageOutcomePool {
  private damageOutcomePools: Map<DamageOutcome, string[]> = new Map();

  constructor() {
    this.initializeDamageOutcomePools();
  }

  /**
   * @description Initialize damage outcome pools
   */
  private initializeDamageOutcomePools(): void {
    this.damageOutcomePools.set('miss', [
      '—the strike is dodged with effortless precision.',
      '—the attack is evaded with practiced skill.',
      '—the move is anticipated and neutralized.',
      '—the opponent reads the attack and counters.',
      '—the strike finds only empty air.',
      '—the attack slips past harmlessly.',
      '—the move is anticipated and avoided.',
      '—the strike is well-executed but anticipated.'
    ]);

    this.damageOutcomePools.set('glance', [
      '—the attack grazes the opponent.',
      '—the strike finds purchase but weakly.',
      '—the move connects but is quickly recovered from.',
      '—the attack lands but fails to penetrate.',
      '—the strike connects but is easily blocked.',
      '—the move lands but without force.',
      '—the attack hits but is partially absorbed.',
      '—the strike lands but fails to penetrate.'
    ]);

    this.damageOutcomePools.set('hit', [
      '—the attack is blocked at the last moment.',
      '—the opponent\'s guard is still up, focus unbroken.',
      '—the strike is parried with expert timing.',
      '—the attack is countered with perfect timing.',
      '—the move is anticipated and avoided.',
      '—the strike is well-executed but anticipated.',
      '—the attack is well-executed but anticipated.',
      '—the opponent\'s guard is still up, focus unbroken.'
    ]);

    this.damageOutcomePools.set('devastating', [
      '—the attack connects with solid execution.',
      '—the strike lands with devastating precision.',
      '—the move hits with good timing.',
      '—the attack finds its mark cleanly.',
      '—the strike connects with solid force.',
      '—the move lands with overwhelming power!',
      '—the attack strikes with devastating force!',
      '—the strike finds purchase but weakly.'
    ]);

    this.damageOutcomePools.set('overwhelming', [
      '—the move connects with devastating effect.',
      '—the attack lands with brutal authority!',
      '—the strike hits with devastating timing!',
      '—the move lands with overwhelming power!',
      '—the attack strikes with devastating force!',
      '—the strike connects with solid force.',
      '—the move hits with good timing.',
      '—the attack finds its mark cleanly.'
    ]);
  }

  /**
   * @description Get damage outcome narrative
   */
  getDamageOutcomeNarrative(outcome: DamageOutcome): string {
    const pool = this.damageOutcomePools.get(outcome);
    if (!pool || pool.length === 0) {
      return '';
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * @description Get all damage outcomes
   */
  getAvailableOutcomes(): DamageOutcome[] {
    return Array.from(this.damageOutcomePools.keys());
  }

  /**
   * @description Get pool size for a specific outcome
   */
  getPoolSize(outcome: DamageOutcome): number {
    const pool = this.damageOutcomePools.get(outcome);
    return pool ? pool.length : 0;
  }
} 