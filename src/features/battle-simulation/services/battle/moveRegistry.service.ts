// Used via dynamic registry in BattleEngine. See SYSTEM ARCHITECTURE.MD for flow.
// @file moveRegistry.service.ts
// @description The single source of truth for accessing move data.
// This service loads all moves and provides methods to query them by ID.
// No other service should import move data directly.

import { ALL_MOVES } from '../../data/moves';
import type { Move } from '../../types/move.types';

class MoveRegistryService {
  private moves: Map<string, Move>;

  constructor() {
    this.moves = new Map(ALL_MOVES.map(move => [move.id, move]));
  }

  /**
   * Retrieves a single move by its unique ID.
   * @param id The unique ID of the move.
   * @returns The Move object or undefined if not found.
   */
  public getMoveById(id: string): Move | undefined {
    return this.moves.get(id);
  }

  /**
   * Retrieves an array of moves from an array of IDs.
   * Filters out any IDs that do not correspond to a valid move.
   * @param ids An array of move IDs.
   * @returns An array of Move objects.
   */
  public getMovesByIds(ids: string[]): Move[] {
    return ids
      .map(id => this.getMoveById(id))
      .filter((move): move is Move => move !== undefined);
  }
}

// Export a singleton instance of the registry
export const MoveRegistry = new MoveRegistryService(); 