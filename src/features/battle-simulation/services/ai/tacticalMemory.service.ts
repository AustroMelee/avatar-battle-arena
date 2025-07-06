// CONTEXT: AI, // FOCUS: TacticalMemory
import type { BattleCharacter } from '../../types';
import type { Ability } from '../../types/move.types';
import { createMechanicLogEntry } from '../utils/mechanicLogUtils';

/**
 * Tactical memory entry for a move.
 */
export interface TacticalMemoryEntry {
  moveName: string;
  totalUses: number;
  lastUsedTurn: number;
  effectiveness: number[]; // Array of effectiveness scores per use
}

/**
 * Persistent tactical memory for a fighter across the whole battle.
 */
export class TacticalMemory {
  private memory: Map<string, TacticalMemoryEntry> = new Map();

  /**
   * Record a move usage and its effectiveness.
   */
  recordMove(move: Ability, turn: number, effectiveness: number): void {
    const entry = this.memory.get(move.name) || {
      moveName: move.name,
      totalUses: 0,
      lastUsedTurn: 0,
      effectiveness: [],
    };
    entry.totalUses++;
    entry.lastUsedTurn = turn;
    entry.effectiveness.push(effectiveness);
    this.memory.set(move.name, entry);
  }

  /**
   * Get the tactical memory entry for a move.
   */
  getEntry(moveName: string): TacticalMemoryEntry | undefined {
    return this.memory.get(moveName);
  }

  /**
   * Get a list of overused or ineffective moves.
   */
  getStaleMoves(threshold: number = 3, minEffectiveness: number = 0.2): string[] {
    const result: string[] = [];
    for (const entry of this.memory.values()) {
      if (entry.totalUses >= threshold) {
        const avgEff = entry.effectiveness.length > 0 ? entry.effectiveness.reduce((a, b) => a + b, 0) / entry.effectiveness.length : 1;
        if (avgEff < minEffectiveness) {
          result.push(entry.moveName);
        }
      }
    }
    return result;
  }

  /**
   * Reset memory (e.g., between battles).
   */
  reset(): void {
    this.memory.clear();
  }
}

/**
 * Checks tactical memory and returns a mechanic log entry if a stale move is avoided.
 */
export function checkTacticalMemoryWithLog({
  actor,
  moveName,
  turn,
  reason = 'Move avoided due to low effectiveness or overuse',
}: {
  actor: string;
  moveName: string;
  turn: number;
  reason?: string;
}) {
  const logEntry = createMechanicLogEntry({
    turn,
    actor,
    mechanic: 'Tactical Memory',
    effect: `${moveName} avoided (AI adapts to stale/ineffective move)`,
    reason,
    meta: { move: moveName }
  });
  return { logEntry };
} 