/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { logStory, logMechanics } from '../utils/mechanicLogUtils';

describe('log helpers', () => {
  it('logStory returns a log with non-empty narrative/result', () => {
    const log = logStory({ turn: 1, narrative: 'test narrative' });
    expect(log?.narrative).toBe('test narrative');
    expect(log?.result).toBe('test narrative');
  });

  it('logMechanics returns a log with non-empty result', () => {
    const log = logMechanics({ turn: 1, text: 'mechanics event' });
    expect(log?.result).toBe('mechanics event');
  });
}); 