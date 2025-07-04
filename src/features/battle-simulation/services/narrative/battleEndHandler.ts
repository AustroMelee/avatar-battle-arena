// CONTEXT: Narrative System, // FOCUS: Battle End Handling
import type { BattleState } from '../../types';
import type { TriggeredNarrative } from './types';
import { StateDrivenNarrativePool } from './stateDrivenNarrativePool';

/**
 * @description Handles battle end narratives and prevents post-victory processing
 */
export class BattleEndHandler {
  private stateDrivenPool: StateDrivenNarrativePool;
  private battleEnded: boolean = false;
  private winner: string | null = null;
  private loser: string | null = null;

  constructor() {
    this.stateDrivenPool = new StateDrivenNarrativePool();
  }

  /**
   * @description Checks if the battle has ended and should prevent further narratives
   */
  isBattleEnded(): boolean {
    return this.battleEnded;
  }

  /**
   * @description Records a battle end and generates appropriate narratives
   */
  recordBattleEnd(state: BattleState): TriggeredNarrative[] {
    if (this.battleEnded) {
      return [];
    }

    this.battleEnded = true;

    if (!state.winner || state.participants.length < 2) {
      return [];
    }

    const winner = state.winner;
    const loser = state.participants.find(p => p.name !== winner.name);
    
    if (!loser) {
      return [];
    }

    this.winner = winner.name;
    this.loser = loser.name;

    // Generate single victory narrative
    const victoryNarrative = this.stateDrivenPool.getVictoryNarrative(winner.name, loser.name);

    return [
      {
        id: `victory_${state.turn}_${winner.name}`,
        speaker: 'System',
        text: victoryNarrative,
        priority: 10,
        timestamp: Date.now()
      }
    ];
  }

  /**
   * @description Filters out narratives for characters who have been defeated
   */
  filterDefeatedCharacterNarratives(
    narratives: TriggeredNarrative[]
  ): TriggeredNarrative[] {
    if (!this.battleEnded) {
      return narratives;
    }

    // If battle has ended, only allow system narratives or winner narratives
    return narratives.filter(narrative => 
      narrative.speaker === 'System' || 
      narrative.speaker === this.winner
    );
  }

  /**
   * @description Checks if a character should be allowed to generate narratives
   */
  canCharacterGenerateNarrative(characterName: string): boolean {
    if (!this.battleEnded) {
      return true;
    }

    // Only the winner can generate narratives after battle end
    return characterName === this.winner;
  }

  /**
   * @description Resets the battle end handler for a new battle
   */
  reset(): void {
    this.battleEnded = false;
    this.winner = null;
    this.loser = null;
    this.stateDrivenPool.reset();
  }

  /**
   * @description Gets the current battle end state for debugging
   */
  getBattleEndState(): {
    battleEnded: boolean;
    winner: string | null;
    loser: string | null;
  } {
    return {
      battleEnded: this.battleEnded,
      winner: this.winner,
      loser: this.loser
    };
  }
} 