import { describe, it, expect } from 'vitest';
import { handleRegularTacticalMove } from '../tacticalMove.service';
import { createMockState } from './helpers/mockState';
import { MoveRegistry } from '../moveRegistry.service';

// Unit test: Basic Strike should always reduce defender HP

describe('handleRegularTacticalMove – Basic Strike', () => {
  it('reduces defender HP', async () => {
    const state = createMockState();
    const move = MoveRegistry.getMoveById('aang_basic_strike');
    const initialHP = state.participants[1].currentHealth;

    const result = await handleRegularTacticalMove(
      move!,
      state.participants[0],
      state.participants[1],
      state,
    );

    expect(result.newTarget.currentHealth).toBeLessThan(initialHP);
    expect(result.newTarget.currentHealth).toBeGreaterThanOrEqual(0);
  });
});
