// CONTEXT: Pool Manager
// RESPONSIBILITY: Manage narrative line pools and selection logic

import type { DamageOutcome, NarrativeTier } from '../types/NarrativeTypes';

/**
 * @description Manages narrative line pools and selection
 */
export class PoolManager {
  private narrativePools: Map<string, string[]> = new Map();
  private damageOutcomePools: Map<DamageOutcome, string[]> = new Map();
  private stateAnnouncementPools: Map<string, string[]> = new Map();
  private oneOffMomentPools: Map<string, string[]> = new Map();

  constructor() {
    this.initializePools();
  }

  /**
   * @description Initialize all narrative pools
   */
  private initializePools(): void {
    this.initializeDamageOutcomePools();
    this.initializeStateAnnouncementPools();
    this.initializeOneOffMomentPools();
  }

  /**
   * @description Initialize damage outcome narrative pools
   */
  private initializeDamageOutcomePools(): void {
    this.damageOutcomePools.set('miss', [
      '—the attack is well-executed but anticipated.',
      '—the strike is precise but the timing is wrong.',
      '—the opponent\'s guard is still up, focus unbroken.',
      '—the attack is blocked at the last moment.',
      '—the move is telegraphed and easily avoided.',
      '—the opponent reads the attack and counters.',
      '—the strike finds only empty air.',
      '—the attack is deflected with practiced ease.',
      '—the opponent sidesteps with fluid grace.',
      '—the move is anticipated and neutralized.',
      '—the attack slips past harmlessly.',
      '—the strike is dodged with effortless precision.',
      '—the move is countered before it can land.',
      '—the attack is parried with expert timing.',
      '—the strike is evaded with practiced skill.',
      '—the move is intercepted and redirected.',
      '—the attack is neutralized before impact.',
      '—the strike is deflected with masterful control.',
      '—the move is anticipated and avoided.',
      '—the attack is countered with perfect timing.'
    ]);

    this.damageOutcomePools.set('glance', [
      '—the attack connects but lacks power.',
      '—the strike lands but is partially blocked.',
      '—the move finds its mark but barely.',
      '—the attack grazes the opponent.',
      '—the strike hits but is deflected.',
      '—the move connects but is absorbed.',
      '—the attack lands but without force.',
      '—the strike finds purchase but weakly.',
      '—the move hits but is countered.',
      '—the attack connects but is mitigated.',
      '—the strike lands but fails to penetrate.',
      '—the move connects but lacks impact.',
      '—the attack hits but is partially absorbed.',
      '—the strike lands but is mostly blocked.',
      '—the move connects but is deflected.',
      '—the attack grazes but fails to wound.',
      '—the strike hits but is easily shrugged off.',
      '—the move connects but is quickly recovered from.',
      '—the attack lands but is immediately countered.',
      '—the strike connects but is easily blocked.'
    ]);

    this.damageOutcomePools.set('hit', [
      '—the attack lands with satisfying impact.',
      '—the strike connects with solid force.',
      '—the move finds its target effectively.',
      '—the attack hits with good timing.',
      '—the strike lands with precision.',
      '—the move connects with authority.',
      '—the attack finds its mark cleanly.',
      '—the strike hits with controlled power.',
      '—the move lands with tactical advantage.',
      '—the attack connects with solid execution.',
      '—the strike lands with devastating precision.',
      '—the move connects with overwhelming force.',
      '—the attack hits with brutal efficiency.',
      '—the strike lands with crushing impact.',
      '—the move connects with masterful control.',
      '—the attack finds its target with deadly accuracy.',
      '—the strike lands with perfect timing.',
      '—the move connects with devastating effect.',
      '—the attack hits with overwhelming power.',
      '—the strike lands with brutal force.'
    ]);

    this.damageOutcomePools.set('devastating', [
      '—the attack strikes with devastating force!',
      '—the move lands with overwhelming power!',
      '—the strike connects with brutal impact!',
      '—the attack hits with crushing strength!',
      '—the move finds its mark with devastating precision!',
      '—the strike lands with overwhelming authority!',
      '—the attack connects with brutal efficiency!',
      '—the move hits with devastating timing!',
      '—the strike finds its target with overwhelming force!',
      '—the attack lands with crushing power!',
      '—the move strikes with unstoppable fury!',
      '—the attack connects with devastating accuracy!',
      '—the strike lands with overwhelming impact!',
      '—the move hits with brutal precision!',
      '—the attack finds its mark with devastating force!',
      '—the strike connects with overwhelming power!',
      '—the move lands with brutal authority!',
      '—the attack hits with devastating efficiency!',
      '—the strike finds its target with crushing force!',
      '—the move connects with overwhelming precision!'
    ]);

    this.damageOutcomePools.set('overwhelming', [
      '—the attack is absolutely overwhelming!',
      '—the move strikes with unstoppable force!',
      '—the attack is completely devastating!',
      '—the strike lands with overwhelming power!',
      '—the move connects with brutal authority!',
      '—the attack hits with crushing dominance!',
      '—the strike finds its mark with overwhelming strength!',
      '—the move lands with devastating impact!',
      '—the attack connects with unstoppable force!',
      '—the strike hits with overwhelming precision!',
      '—the move is absolutely unstoppable!',
      '—the attack is completely overwhelming!',
      '—the strike is devastatingly powerful!',
      '—the move is brutally effective!',
      '—the attack is overwhelmingly strong!',
      '—the strike is completely unstoppable!',
      '—the move is devastatingly accurate!',
      '—the attack is brutally overwhelming!',
      '—the strike is completely devastating!',
      '—the move is absolutely crushing!'
    ]);
  }

  /**
   * @description Initialize state announcement pools
   */
  private initializeStateAnnouncementPools(): void {
    this.stateAnnouncementPools.set('breaking_point', [
      'The pressure is mounting—something has to give!',
      'The tension reaches a breaking point!',
      'The battle reaches a critical moment!',
      'The intensity reaches new heights!',
      'The conflict escalates to a new level!',
      'Suddenly, everything hangs in the balance.',
      'A wave of fury crashes through the throne room.',
      'Air and fire clash with renewed ferocity!',
      'The ancient stones themselves seem to tremble.',
      'The very air crackles with barely contained power.'
    ]);

    this.stateAnnouncementPools.set('escalation', [
      'The battle escalates with renewed intensity!',
      'The conflict reaches a new level of ferocity!',
      'The intensity of the fight increases dramatically!',
      'The battle takes on a new level of urgency!',
      'The conflict escalates with overwhelming force!',
      'Suddenly, everything hangs in the balance.',
      'A wave of fury crashes through the throne room.',
      'Air and fire clash with renewed ferocity!',
      'The ancient stones themselves seem to tremble.',
      'The very air crackles with barely contained power.',
      'The throne room becomes a maelstrom of elemental fury!',
      'The battle reaches a fever pitch!',
      'The intensity becomes almost unbearable!',
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
   * @description Initialize one-off moment pools
   */
  private initializeOneOffMomentPools(): void {
    this.oneOffMomentPools.set('first_blood', [
      'First blood is drawn in this intense battle!',
      'The first strike lands, marking the beginning!',
      'The opening salvo finds its mark!',
      'The first blow connects, setting the tone!',
      'The initial strike lands with impact!',
      'The first wound is inflicted in this legendary clash!',
      'Blood is drawn for the first time in this epic duel!',
      'The opening exchange draws first blood!',
      'The first strike finds its mark with devastating effect!',
      'The initial blow sets the stage for this epic battle!'
    ]);

    this.oneOffMomentPools.set('critical_hit', [
      'A critical strike lands with devastating force!',
      'The attack finds a perfect opening!',
      'A critical blow strikes with overwhelming power!',
      'The strike lands at the perfect moment!',
      'A critical hit connects with brutal efficiency!',
      'The attack finds a critical weakness!',
      'A devastating blow strikes with perfect precision!',
      'The strike lands with devastating accuracy!',
      'A critical hit finds its mark with overwhelming force!',
      'The attack strikes with devastating power!',
      'A perfect strike lands with devastating effect!',
      'The critical blow finds its target with brutal force!',
      'A devastating attack strikes with overwhelming power!',
      'The critical hit lands with devastating precision!',
      'A perfect blow strikes with devastating accuracy!'
    ]);

    this.oneOffMomentPools.set('desperation_trigger', [
      'Desperation takes hold as the situation becomes dire!',
      'The desperate situation forces a change in tactics!',
      'Desperation drives them to new extremes!',
      'The desperate circumstances demand action!',
      'Desperation becomes their driving force!',
      'The situation becomes desperate, forcing drastic measures!',
      'Desperation takes hold as survival becomes the only goal!',
      'The desperate circumstances force them to fight like cornered animals!',
      'Desperation drives them to tap into their final reserves!',
      'The desperate situation forces them to abandon all caution!',
      'Desperation becomes their only weapon!',
      'The desperate circumstances force them to fight with everything they have!',
      'Desperation takes hold as they fight for their very survival!',
      'The desperate situation forces them to use every trick they know!',
      'Desperation drives them to fight with the fury of the doomed!'
    ]);

    this.oneOffMomentPools.set('escalation_trigger', [
      'The battle escalates to new heights of intensity!',
      'The conflict reaches a new level of ferocity!',
      'The intensity of the fight increases dramatically!',
      'The battle takes on a new level of urgency!',
      'The conflict escalates with overwhelming force!',
      'The battle reaches a fever pitch of intensity!',
      'The conflict escalates to new heights of ferocity!',
      'The intensity becomes almost unbearable!',
      'The battle takes on a desperate edge!',
      'The conflict escalates with overwhelming power!',
      'The battle reaches new heights of fury!',
      'The conflict escalates to new levels of intensity!',
      'The battle takes on a new level of desperation!',
      'The conflict escalates with overwhelming ferocity!',
      'The battle reaches new heights of desperation!'
    ]);

    this.oneOffMomentPools.set('pattern_break', [
      'The established pattern is completely shattered!',
      'The predictable rhythm is utterly broken!',
      'The familiar tactics are completely abandoned!',
      'The established order is dramatically disrupted!',
      'The predictable flow is violently interrupted!',
      'All previous tactics are thrown to the wind!',
      'The battle takes an unexpected turn!',
      'The familiar dance becomes a chaotic brawl!',
      'The established rhythm is torn apart!',
      'The predictable becomes unpredictable!',
      'The established pattern is completely destroyed!',
      'The predictable rhythm is completely shattered!',
      'The familiar tactics are completely forgotten!',
      'The established order is completely disrupted!',
      'The predictable flow is completely interrupted!'
    ]);

    this.oneOffMomentPools.set('final_gambit', [
      'This is their final gambit—everything on the line!',
      'The final desperate move is unleashed!',
      'This is their last chance—all or nothing!',
      'The final gambit is played with everything at stake!',
      'This is their ultimate move—no turning back!',
      'The final desperate attempt is made!',
      'This is their last hope—everything or nothing!',
      'The final gambit is played with their very life at stake!',
      'This is their ultimate desperate move!',
      'The final attempt is made with everything they have!',
      'This is their last desperate chance!',
      'The final gambit is played with their survival at stake!',
      'This is their ultimate last chance!',
      'The final desperate move is made with everything on the line!',
      'This is their last hope for survival!'
    ]);

    this.oneOffMomentPools.set('victory_moment', [
      'Victory is achieved with overwhelming force!',
      'The battle is won with decisive action!',
      'Victory is secured with perfect execution!',
      'The conflict ends in triumphant victory!',
      'Victory is claimed with undeniable authority!',
      'The battle is won with devastating finality!',
      'Victory is achieved with overwhelming power!',
      'The conflict ends in glorious triumph!',
      'Victory is secured with devastating force!',
      'The battle is won with undeniable dominance!',
      'Victory is achieved with overwhelming authority!',
      'The conflict ends in spectacular triumph!',
      'Victory is secured with devastating power!',
      'The battle is won with overwhelming force!',
      'Victory is achieved with undeniable dominance!'
    ]);

    this.oneOffMomentPools.set('defeat_moment', [
      'Defeat comes with crushing finality!',
      'The battle ends in devastating defeat!',
      'Defeat is sealed with overwhelming force!',
      'The conflict concludes in bitter defeat!',
      'Defeat is delivered with undeniable finality!',
      'The battle ends in crushing defeat!',
      'Defeat comes with devastating finality!',
      'The conflict ends in overwhelming defeat!',
      'Defeat is sealed with devastating force!',
      'The battle concludes in bitter defeat!',
      'Defeat is delivered with crushing finality!',
      'The conflict ends in devastating defeat!',
      'Defeat comes with overwhelming finality!',
      'The battle ends in bitter defeat!',
      'Defeat is sealed with undeniable finality!'
    ]);
  }

  /**
   * @description Get a random line from a pool
   */
  getRandomLine(pool: string[]): string {
    if (!pool || pool.length === 0) {
      return '';
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * @description Get damage outcome narrative
   */
  getDamageOutcomeNarrative(outcome: DamageOutcome): string {
    const pool = this.damageOutcomePools.get(outcome);
    return this.getRandomLine(pool || []);
  }

  /**
   * @description Get state announcement narrative
   */
  getStateAnnouncementNarrative(stateType: string): string {
    const pool = this.stateAnnouncementPools.get(stateType);
    return this.getRandomLine(pool || []);
  }

  /**
   * @description Get one-off moment narrative
   */
  getOneOffMomentNarrative(momentType: string): string {
    const pool = this.oneOffMomentPools.get(momentType);
    return this.getRandomLine(pool || []);
  }

  /**
   * @description Get narrative tier based on context
   */
  getNarrativeTier(turnNumber: number, healthPercentage: number): NarrativeTier {
    if (healthPercentage <= 15) return 'exhausted';
    if (turnNumber >= 12) return 'late';
    if (turnNumber >= 6) return 'mid';
    return 'early';
  }

  /**
   * @description Add custom narrative pool
   */
  addCustomPool(poolName: string, lines: string[]): void {
    this.narrativePools.set(poolName, lines);
  }

  /**
   * @description Get custom narrative pool
   */
  getCustomPool(poolName: string): string[] {
    return this.narrativePools.get(poolName) || [];
  }
} 