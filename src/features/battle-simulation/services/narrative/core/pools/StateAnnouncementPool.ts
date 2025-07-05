// CONTEXT: State Announcement Pool
// RESPONSIBILITY: Manage state announcement narrative pools only

import type { StateAnnouncementType } from '../../types/NarrativeTypes';

/**
 * @description Service for managing state announcement narrative pools
 */
export class StateAnnouncementPool {
  private stateAnnouncementPools: Map<string, string[]> = new Map();

  constructor() {
    this.initializeStateAnnouncementPools();
  }

  /**
   * @description Initialize state announcement pools
   */
  private initializeStateAnnouncementPools(): void {
    this.stateAnnouncementPools.set('escalation', [
      'The conflict erupts, each blow heavier than the last.',
      'The throne room shakes as the benders push past their limits.',
      'A primal storm of air and fire engulfs the battlefield.',
      'Neither combatant yields—this is their defining moment.',
      'The ancient stones themselves seem to tremble.',
      'The throne room becomes a maelstrom of elemental fury!',
      'Air and fire clash with renewed ferocity!',
      'The very air crackles with barely contained power.',
      'The battle escalates with renewed intensity!',
      'The intensity becomes almost unbearable!',
      'The battle takes on a new level of urgency!',
      'The conflict escalates with overwhelming force!',
      'Suddenly, everything hangs in the balance.',
      'A wave of fury crashes through the throne room.',
      'The battle reaches a fever pitch!',
      'The conflict takes on a desperate edge!',
      'The air itself seems to burn with their fury!'
    ]);

    this.stateAnnouncementPools.set('desperation', [
      'Desperation fuels their movements!',
      'The situation becomes desperate!',
      'Desperation drives their actions!',
      'The battle reaches a desperate point!',
      'Desperation takes hold of the combat!',
      'Barely standing, they pour every ounce of hope into their next strike.',
      'Their resolve hardens; they fight not for victory, but survival.',
      'The last reserves of strength are called upon.',
      'Every movement becomes a desperate gamble.',
      'The will to survive overrides all else.',
      'They fight like cornered animals, all grace forgotten.',
      'The final reserves of energy are tapped.',
      'Desperation becomes their driving force.',
      'They fight with the fury of the doomed.',
      'Survival instinct takes over completely.'
    ]);

    this.stateAnnouncementPools.set('pattern_break', [
      'The established pattern is shattered!',
      'The predictable rhythm is broken!',
      'The familiar tactics are abandoned!',
      'The established order is disrupted!',
      'The predictable flow is interrupted!',
      'The established pattern is completely shattered!',
      'The predictable rhythm is utterly broken!',
      'The familiar tactics are completely abandoned!',
      'The established order is dramatically disrupted!',
      'The predictable flow is violently interrupted!',
      'All previous tactics are thrown to the wind!',
      'The battle takes an unexpected turn!',
      'The familiar dance becomes a chaotic brawl!',
      'The established rhythm is torn apart!',
      'The predictable becomes unpredictable!'
    ]);
  }

  /**
   * @description Get state announcement narrative
   */
  getStateAnnouncementNarrative(stateType: string): string {
    const pool = this.stateAnnouncementPools.get(stateType);
    if (!pool || pool.length === 0) {
      return '';
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * @description Get all available state types
   */
  getAvailableStateTypes(): string[] {
    return Array.from(this.stateAnnouncementPools.keys());
  }

  /**
   * @description Get pool size for a specific state type
   */
  getPoolSize(stateType: string): number {
    const pool = this.stateAnnouncementPools.get(stateType);
    return pool ? pool.length : 0;
  }
} 