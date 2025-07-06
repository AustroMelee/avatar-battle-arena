// CONTEXT: Narrative System, // FOCUS: State-Driven Narrative Pool

// No imports needed for this file

/**
 * @description Tracks narrative state changes to prevent repetition
 */
export type NarrativeStateTracker = {
  escalationCount: number;
  climaxCount: number;
  desperationCount: number;
  patternBreakCount: number;
  lastDamageOutcome: string;
  lastDefensiveAction: string;
  consecutiveMisses: number;
  consecutiveHits: number;
  lastStateChange: string;
  turnCount: number;
};

/**
 * @description State-driven narrative pools with contextual variations
 */
export class StateDrivenNarrativePool {
  private stateTracker: NarrativeStateTracker;

  constructor() {
    this.stateTracker = {
      escalationCount: 0,
      climaxCount: 0,
      desperationCount: 0,
      patternBreakCount: 0,
      lastDamageOutcome: '',
      lastDefensiveAction: '',
      consecutiveMisses: 0,
      consecutiveHits: 0,
      lastStateChange: '',
      turnCount: 0
    };
  }

  /**
   * @description Updates the state tracker with current context
   */
  updateState(_ctx: unknown): void {
    const ctx = _ctx as NarrativeContext;
    
    if (ctx.turnIndex !== undefined) {
      this.stateTracker.turnCount = ctx.turnIndex;
    }
    
    // Track damage outcomes
    if (ctx.damage !== undefined) {
      if (ctx.damage === 0) {
        this.stateTracker.consecutiveMisses++;
        this.stateTracker.consecutiveHits = 0;
        this.stateTracker.lastDamageOutcome = 'miss';
      } else {
        this.stateTracker.consecutiveHits++;
        this.stateTracker.consecutiveMisses = 0;
        this.stateTracker.lastDamageOutcome = ctx.damage > 15 ? 'high' : 'moderate';
      }
    }

    // Track state changes
    if (ctx.mechanics?.forcedEscalation) {
      this.stateTracker.escalationCount++;
      this.stateTracker.lastStateChange = 'escalation';
    }
    if (ctx.mechanics?.isDesperation) {
      this.stateTracker.desperationCount++;
      this.stateTracker.lastStateChange = 'desperation';
    }
    if (ctx.mechanics?.moveRepetition && ctx.mechanics.moveRepetition >= 3) {
      this.stateTracker.patternBreakCount++;
      this.stateTracker.lastStateChange = 'pattern_break';
    }
  }

  /**
   * @description Gets contextual escalation narrative based on state
   */
  getEscalationNarrative(_ctx: unknown): string {
    const { escalationCount } = this.stateTracker;
    
    if (escalationCount === 1) {
      return "The battle reaches a breaking point! Both fighters are forced to escalate or face defeat!";
    } else if (escalationCount === 2) {
      return "Neither fighter can hold back now; a single misstep means disaster.";
    } else if (escalationCount === 3) {
      return "Each breath, every motion, feels like the threshold to oblivion.";
    } else {
      return "The tension is unbearable—one wrong move will end everything.";
    }
  }

  /**
   * @description Gets contextual pattern break narrative based on state
   */
  getPatternBreakNarrative(_ctx: unknown): string {
    const { patternBreakCount } = this.stateTracker;
    
    if (patternBreakCount === 1) {
      return "The repetitive rhythm shatters as they adapt their fighting style!";
    } else if (patternBreakCount === 2) {
      return "They feel the pattern and consciously choose to disrupt it!";
    } else if (patternBreakCount === 3) {
      return "Their movements become unpredictable, serpentine—they abandon their old rhythm!";
    } else {
      return "Their tactics shift—their opponent's predictability becomes their advantage!";
    }
  }

  /**
   * @description Gets contextual damage narrative with character-specific details
   */
  getDamageNarrative(_ctx: unknown, damage: number): string {
    const { consecutiveHits, consecutiveMisses } = this.stateTracker;
    
    if (damage === 0) {
      return this.getMissNarrative(_ctx, consecutiveMisses);
    } else if (damage <= 5) {
      return this.getGlanceNarrative(_ctx);
    } else if (damage <= 15) {
      return this.getHitNarrative(_ctx, consecutiveHits);
    } else if (damage <= 30) {
      return this.getDevastatingNarrative(_ctx);
    } else {
      return this.getOverwhelmingNarrative(_ctx);
    }
  }

  /**
   * @description Gets miss narrative with character-specific details
   */
  private getMissNarrative(_ctx: unknown, consecutiveMisses: number): string {
    if (!hasActorAndTarget(_ctx)) {
      return "The attack misses its target.";
    }
    
    const { actor, target } = _ctx;
    
    if (actor.name === 'Aang') {
      if (consecutiveMisses === 1) {
        return `${target.name} narrowly avoids Aang's airbending strike.`;
      } else if (consecutiveMisses === 2) {
        return `Aang's attack is deflected by ${target.name}'s guard.`;
      } else {
        return `The gentle airbender's strike is too soft.`;
      }
    } else if (actor.name === 'Azula') {
      if (consecutiveMisses === 1) {
        return `${target.name} narrowly avoids Azula's blue fire.`;
      } else if (consecutiveMisses === 2) {
        return `Azula's precision is off this time.`;
      } else {
        return `The princess's attack is expertly dodged.`;
      }
    }
    
    return `${target.name} dodges the attack gracefully.`;
  }

  /**
   * @description Gets glance narrative with character-specific details
   */
  private getGlanceNarrative(_ctx: unknown): string {
    if (!hasActorAndTarget(_ctx)) {
      return "The attack connects, but lacks power.";
    }
    
    const { actor, target } = _ctx;
    
    if (actor.name === 'Aang') {
      return `Aang's strike glances off ${target.name}'s guard, his hesitation showing as exhaustion creeps in.`;
    } else if (actor.name === 'Azula') {
      return `Azula's fire barely singes ${target.name}, her normally devastating power diminished by fatigue.`;
    }
    
    return `The attack connects, but lacks power.`;
  }

  /**
   * @description Gets hit narrative with character-specific details
   */
  private getHitNarrative(_ctx: unknown, consecutiveHits: number): string {
    if (!hasActorAndTarget(_ctx)) {
      return "The attack lands with solid impact!";
    }
    
    const { actor, target } = _ctx;
    
    if (actor.name === 'Aang') {
      if (consecutiveHits === 1) {
        return `Aang flows like water, staff flickering—his strike snaps across ${target.name}'s shoulder, stinging pride and skin alike.`;
      } else {
        return `The Avatar's training pays off with a solid hit!`;
      }
    } else if (actor.name === 'Azula') {
      if (consecutiveHits === 1) {
        return `Azula's blue fire strikes with deadly accuracy!`;
      } else {
        return `The princess's attack burns with calculated precision!`;
      }
    }
    
    return `The attack lands with solid impact!`;
  }

  /**
   * @description Gets devastating narrative with character-specific details
   */
  private getDevastatingNarrative(_ctx: unknown): string {
    if (!hasActorAndTarget(_ctx)) {
      return "The attack devastates with brutal efficiency!";
    }
    
    const { actor, target } = _ctx;
    
    if (actor.name === 'Aang') {
      return `Aang's palm strike lands squarely, air rippling from the impact!`;
    } else if (actor.name === 'Azula') {
      return `Blue fire engulfs ${target.name}, blasting them across the ring. The crowd gasps—Azula's power is inescapable!`;
    }
    
    return `The attack devastates ${target.name} with brutal efficiency!`;
  }

  /**
   * @description Gets overwhelming narrative with character-specific details
   */
  private getOverwhelmingNarrative(_ctx: unknown): string {
    if (!hasActorAndTarget(_ctx)) {
      return "An overwhelming assault that nearly ends the battle!";
    }
    
    const { actor, target } = _ctx;
    
    if (actor.name === 'Aang') {
      return `A cyclone whirls from Aang's staff, uprooting tiles as ${target.name} braces for impact!`;
    } else if (actor.name === 'Azula') {
      return `Azula's eyes glitter as she hurls blue fire, a tidal wave of destruction rolling toward ${target.name}!`;
    }
    
    return `An overwhelming assault that nearly ends the battle!`;
  }

  /**
   * @description Gets contextual defensive narrative
   */
  getDefensiveNarrative(_ctx: unknown): string {
    if (!hasActorAndTarget(_ctx)) {
      return "The fighter expertly dodges the attack.";
    }
    
    const { actor, target } = _ctx;
    
    if (actor.name === 'Aang') {
      return `Aang bends at the waist, ${target.name}'s attack hissing past his ear.`;
    } else if (actor.name === 'Azula') {
      return `${target.name}'s scowl deepens as their attack finds only empty air.`;
    }
    
    return `${actor.name} expertly dodges the attack.`;
  }

  /**
   * @description Gets victory narrative for the winner
   */
  getVictoryNarrative(winner: string, loser: string): string {
    if (winner === 'Azula') {
      return `Azula stands victorious, blue fire still crackling at her fingertips. ${loser} lies unconscious, the battle decided.`;
    } else if (winner === 'Aang') {
      return `Aang stands triumphant, the air around him still swirling with power. ${loser} has been defeated.`;
    }
    
    return `${winner} emerges victorious!`;
  }

  /**
   * @description Gets defeat narrative for the loser
   */
  getDefeatNarrative(loser: string, winner: string): string {
    if (loser === 'Aang') {
      return `Aang crumples, the world spinning—${winner}'s victory is absolute.`;
    } else if (loser === 'Azula') {
      return `Azula falls, her blue fire sputtering out—${winner} has prevailed.`;
    }
    
    return `${loser} falls, unable to continue.`;
  }

  /**
   * @description Resets the state tracker for a new battle
   */
  reset(): void {
    this.stateTracker = {
      escalationCount: 0,
      climaxCount: 0,
      desperationCount: 0,
      patternBreakCount: 0,
      lastDamageOutcome: '',
      lastDefensiveAction: '',
      consecutiveMisses: 0,
      consecutiveHits: 0,
      lastStateChange: '',
      turnCount: 0
    };
  }

  /**
   * @description Gets the current state for debugging
   */
  getState(): Record<string, unknown> {
    return {
      stateTracker: { ...this.stateTracker }
    };
  }
}

// CONTEXT: Narrative Pool Management
// RESPONSIBILITY: Manage state-driven narrative pools for battle storytelling

/**
 * @description Context interface for narrative generation
 */
interface NarrativeContext {
  turnIndex?: number;
  actor?: { name: string };
  target?: { name: string };
  damage?: number;
  mechanics?: {
    forcedEscalation?: boolean;
    isDesperation?: boolean;
    moveRepetition?: number;
  };
}

/**
 * @description Type guard to check if context has actor and target
 */
function hasActorAndTarget(ctx: unknown): ctx is { actor: { name: string }; target: { name: string } } {
  return typeof ctx === 'object' && ctx !== null && 
         'actor' in ctx && 'target' in ctx &&
         typeof (ctx as any).actor === 'object' && 
         typeof (ctx as any).target === 'object';
}

/**
 * @description Type guard to check if context has mechanics
 */
function hasMechanics(ctx: unknown): ctx is { mechanics: { forcedEscalation?: boolean; isDesperation?: boolean; moveRepetition?: number } } {
  return typeof ctx === 'object' && ctx !== null && 'mechanics' in ctx;
} 